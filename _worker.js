const SUPABASE_URL = 'https://vjhcfbwuyebiesxslwhe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaGNmYnd1eWViaWVzeHNsd2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTY5NTcsImV4cCI6MjA5NTczMjk1N30.UaXpJKBVxUslGYOdkXJF-vg_QJC0cCArzlDYPVQVHN4';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Max-Age': '86400' },
      });
    }

    // Upload endpoint
    if (method === 'POST' && url.pathname === '/api/upload') {
      return handleUpload(request);
    }

    // Serve static assets
    let path = url.pathname;
    if (path === '/' || path === '') {
      path = '/index.html';
    } else if (path.endsWith('/')) {
      path = path + 'index.html';
    } else if (!path.includes('.')) {
      path = path + '/index.html';
    }

    const indexReq = new Request(new URL(path, url), request);
    const res = await env.ASSETS.fetch(indexReq);
    if (res.status === 200) return res;

    return new Response('Not Found', { status: 404 });
  }
};

async function handleUpload(request) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    var fileName = 'file';
    var body;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!file) return jsonResponse({ error: 'No file uploaded' }, 400);
      fileName = file.name;
      body = file;
    } else {
      body = request.body;
      fileName = request.headers.get('X-File-Name') || 'file_' + Date.now();
    }

    if (!body) return jsonResponse({ error: 'No file uploaded' }, 400);

    var ext = fileName.split('.').pop();
    var storagePath = String(Date.now()) + '_' + Math.random().toString(36).slice(2) + '.' + ext;

    // Upload to Supabase Storage
    var uploadRes = await fetch(SUPABASE_URL + '/storage/v1/object/tmp-files/' + storagePath, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': request.headers.get('X-Content-Type') || 'application/octet-stream',
      },
      body: body,
    });

    if (!uploadRes.ok) {
      var errText = await uploadRes.text().catch(function(){ return ''; });
      return jsonResponse({ error: 'Upload failed: ' + uploadRes.status + ' ' + errText }, 502);
    }

    // Get file size from the request
    var contentLength = request.headers.get('Content-Length');
    var fileSize = contentLength ? parseInt(contentLength) : 0;

    // Create DB record
    var sid = Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10);
    var fileUrl = SUPABASE_URL + '/storage/v1/object/public/tmp-files/' + storagePath;
    var contentTypeHeader = request.headers.get('X-Content-Type') || '';

    var recordRes = await fetch(SUPABASE_URL + '/rest/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        mime_type: contentTypeHeader || null,
        share_id: sid,
      }),
    });

    if (!recordRes.ok) {
      return jsonResponse({ error: 'Database save failed' }, 502);
    }

    var baseUrl = new URL(request.url).origin + '/tmpdrop/';
    var shareLink = baseUrl + '?d=' + sid;

    return jsonResponse({
      success: true,
      share_id: sid,
      url: shareLink,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
