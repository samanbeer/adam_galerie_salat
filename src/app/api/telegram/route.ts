import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { extractTakenDate } from '@/lib/exif';

export const dynamic = 'force-dynamic';

async function sendTelegramMessage(chatId: number | string, text: string, token: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    console.error('Chyba při odesílání zprávy do Telegramu:', e);
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Adam Galerie Salát Telegram Webhook is active 🚀',
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 500 });
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = update.message;
  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const userId = message.from?.id;
  const userFirstName = message.from?.first_name || 'Uživateli';

  // 1. Oprávnění (Whitelist uživatelů)
  const allowedUserIdsEnv = process.env.ALLOWED_TELEGRAM_USER_IDS;
  if (allowedUserIdsEnv) {
    const allowedIds = allowedUserIdsEnv.split(',').map((s) => s.trim()).filter(Boolean);
    if (allowedIds.length > 0 && !allowedIds.includes(String(userId))) {
      await sendTelegramMessage(
        chatId,
        `⛔ Nemáš oprávnění nahrávat fotky do galerie.\n\nTvoje Telegram ID je: \`${userId}\`\nPožádej správce o přidání tohoto ID do povolených uživatelů.`,
        token
      );
      return NextResponse.json({ ok: true });
    }
  }

  // 2. Příkazy /start a /help
  const text = message.text?.trim();
  if (text === '/start' || text === '/help') {
    await sendTelegramMessage(
      chatId,
      `Ahoj ${userFirstName}! 👋\n\nTohle je bot pro nahrávání fotek do *Adam Galerie Salát* 🥗📸\n\n🆔 Tvoje Telegram ID: \`${userId}\`\n\n📸 *Jak přidat fotku:*\n1. Pošli fotku sem do chatu.\n2. 💡 *Tip:* Pro zachování původního EXIF data pořízení a plné kvality fotku pošli jako *Soubor / Dokument* (bez komprese).\n3. Bot fotku automaticky zařadí do galerie podle data focení!`,
      token
    );
    return NextResponse.json({ ok: true });
  }

  // 3. Zpracování fotky nebo dokumentu
  let fileId: string | null = null;
  let originalFilename = `photo_${Date.now()}.jpg`;
  let mimeType = 'image/jpeg';

  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    // Vezmeme největší rozlišení (poslední prvek v poli)
    const highestRes = message.photo[message.photo.length - 1];
    fileId = highestRes.file_id;
  } else if (message.document) {
    const doc = message.document;
    const isImageMime = doc.mime_type?.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|heic|gif)$/i.test(doc.file_name || '');

    if (isImageMime || isImageExt) {
      fileId = doc.file_id;
      originalFilename = doc.file_name || originalFilename;
      mimeType = doc.mime_type || mimeType;
    } else {
      await sendTelegramMessage(chatId, '⚠️ Tento soubor nevypadá jako obrázek. Pošli prosím JPEG, PNG nebo WebP.', token);
      return NextResponse.json({ ok: true });
    }
  }

  if (!fileId) {
    // Zpráva nebyla fotka ani podporovaný soubor
    await sendTelegramMessage(
      chatId,
      '📸 Pošli mi fotku nebo obrázek jako dokument, a já ji vložím do galerie!',
      token
    );
    return NextResponse.json({ ok: true });
  }

  try {
    // 4. Získání informací o souboru z Telegram API
    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const getFileData = await getFileRes.json();

    if (!getFileData.ok || !getFileData.result?.file_path) {
      throw new Error(`Telegram getFile selhalo: ${JSON.stringify(getFileData)}`);
    }

    const filePath = getFileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // 5. Stažení souboru
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) {
      throw new Error(`Nepodařilo se stáhnout soubor z Telegramu (${fileRes.status})`);
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Extrakce EXIF data focení
    const messageDate = message.date ? new Date(message.date * 1000) : new Date();
    const takenAt = await extractTakenDate(buffer, originalFilename, messageDate);

    // 7. Nahrání do Supabase Storage
    const supabase = getSupabaseAdmin();
    const year = takenAt.getFullYear();
    const month = String(takenAt.getMonth() + 1).padStart(2, '0');
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${year}/${month}/${Date.now()}_${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Chyba Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(storagePath);
    const photoUrl = publicUrlData.publicUrl;

    // 8. Uložení záznamu do databáze
    const caption = message.caption || null;
    const { error: dbError } = await supabase.from('photos').insert({
      url: photoUrl,
      filename: originalFilename,
      taken_at: takenAt.toISOString(),
      caption,
    });

    if (dbError) {
      throw new Error(`Chyba zápisu do DB: ${dbError.message}`);
    }

    // 9. Potvrzení odesílateli
    const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(takenAt);

    await sendTelegramMessage(
      chatId,
      `✅ *Fotka byla úspěšně přidána do galerie!*\n\n📅 Datum focení: *${formattedDate}*\n📁 Soubor: \`${originalFilename}\`${
        caption ? `\n💬 Popisek: _${caption}_` : ''
      }`,
      token
    );

    return NextResponse.json({ ok: true, url: photoUrl, taken_at: takenAt.toISOString() });
  } catch (error: any) {
    console.error('Chyba zpracování fotky z Telegramu:', error);
    await sendTelegramMessage(
      chatId,
      `❌ Nastala chyba při ukládání fotky:\n\`${error?.message || 'Neznámá chyba'}\``,
      token
    );
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
