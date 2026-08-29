import { getSiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "@/actions";
import { Save, Settings } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Website Settings & Configuration</h1>
        <p className="text-xs text-[#667085]">
          Manage company contact numbers, WhatsApp integration, social media profiles, and SEO defaults.
        </p>
      </div>

      <form action={async (formData: FormData) => {
        "use server";
        const newSettings: Record<string, string> = {
          company_name: formData.get("company_name") as string,
          tagline: formData.get("tagline") as string,
          phone_1: formData.get("phone_1") as string,
          phone_2: formData.get("phone_2") as string,
          whatsapp_number: formData.get("whatsapp_number") as string,
          email: formData.get("email") as string,
          address: formData.get("address") as string,
          instagram_url: formData.get("instagram_url") as string,
          facebook_url: formData.get("facebook_url") as string,
          youtube_url: formData.get("youtube_url") as string,
          seo_title: formData.get("seo_title") as string,
          seo_description: formData.get("seo_description") as string,
          footer_text: formData.get("footer_text") as string,
        };
        await updateSiteSettings(newSettings);
      }} className="space-y-6">

        {/* 1. Contact Information */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
          <h2 className="font-extrabold text-base text-[#0B1026]">1. Contact & WhatsApp Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Primary Phone (Phone 1) *</label>
              <input
                type="text"
                name="phone_1"
                defaultValue={settings.phone_1}
                required
                placeholder="+91 70342 67985"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Secondary Phone (Phone 2)</label>
              <input
                type="text"
                name="phone_2"
                defaultValue={settings.phone_2}
                placeholder="+91 70342 67986"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#3478F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">WhatsApp Number (Digits with country code) *</label>
              <input
                type="text"
                name="whatsapp_number"
                defaultValue={settings.whatsapp_number}
                required
                placeholder="917034267985"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#16A36A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Support Email Address *</label>
              <input
                type="email"
                name="email"
                defaultValue={settings.email}
                required
                placeholder="dexploraindia@gmail.com"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Office Address *</label>
            <input
              type="text"
              name="address"
              defaultValue={settings.address}
              required
              placeholder="Dexplora Tour Planners, MG Road, Kochi, Kerala"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>
        </div>

        {/* 2. Brand Identity */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
          <h2 className="font-extrabold text-base text-[#0B1026]">2. Branding & Footer</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                defaultValue={settings.company_name}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Company Tagline</label>
              <input
                type="text"
                name="tagline"
                defaultValue={settings.tagline}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Footer About Text</label>
            <textarea
              name="footer_text"
              defaultValue={settings.footer_text}
              rows={3}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>
        </div>

        {/* 3. Social Media & SEO */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
          <h2 className="font-extrabold text-base text-[#0B1026]">3. Social Media Links & SEO</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Instagram URL</label>
              <input
                type="url"
                name="instagram_url"
                defaultValue={settings.instagram_url}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Facebook URL</label>
              <input
                type="url"
                name="facebook_url"
                defaultValue={settings.facebook_url}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">YouTube URL</label>
              <input
                type="url"
                name="youtube_url"
                defaultValue={settings.youtube_url}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Default SEO Meta Title</label>
            <input
              type="text"
              name="seo_title"
              defaultValue={settings.seo_title}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Default SEO Meta Description</label>
            <textarea
              name="seo_description"
              defaultValue={settings.seo_description}
              rows={2}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl text-sm shadow-xl transition-all flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Save className="w-4 h-4" />
          <span>Save Website Settings</span>
        </button>
      </form>
    </div>
  );
}
