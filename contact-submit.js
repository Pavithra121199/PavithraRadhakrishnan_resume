import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const hasSupabaseLib = typeof window.supabase !== 'undefined';
const hasConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabaseClient = hasSupabaseLib && hasConfig
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('contactSubmitBtn');
const statusEl = document.getElementById('formStatus');

if (form && submitBtn && statusEl) {
  if (!hasSupabaseLib) {
    statusEl.textContent = 'Supabase library failed to load. Check internet/CDN access.';
    statusEl.className = 'form-status error';
  }

  if (!hasConfig) {
    statusEl.textContent = 'Supabase config is missing. Check supabase-config.js.';
    statusEl.className = 'form-status error';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      statusEl.textContent = 'Supabase is not initialized correctly.';
      statusEl.className = 'form-status error';
      return;
    }

    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get('full_name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim()
    };

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    statusEl.textContent = 'Submitting your message...';
    statusEl.className = 'form-status';

    try {
      const { error } = await supabaseClient
        .from('contact_submissions')
        .insert([payload]);

      if (error) {
        throw error;
      }

      statusEl.textContent = 'Message sent successfully. Thank you!';
      statusEl.className = 'form-status success';
      form.reset();
    } catch (err) {
      const message = err && err.message ? err.message : 'Unexpected error';
      const code = err && err.code ? ` (code: ${err.code})` : '';
      const hint = err && err.hint ? ` Hint: ${err.hint}` : '';
      const details = err && err.details ? ` Details: ${err.details}` : '';
      statusEl.textContent = `Unable to submit right now. ${message}${code}.${hint}${details}`;
      statusEl.className = 'form-status error';
      console.error('Supabase insert failed:', err);
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}
