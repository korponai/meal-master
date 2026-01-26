import type { Database } from "@/types/database.types";

export default defineNuxtPlugin((nuxtApp) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient<Database>();

  // Access i18n instance directly from nuxtApp to avoid "Must be called at top of setup" error
  // caused by useI18n() inside a plugin in some contexts.
  const i18n = nuxtApp.$i18n as any;
  const setLocale = i18n.setLocale;
  // locale is a ref in the i18n instance
  const currentLocale = i18n.locale;

  const i18nCookie = useCookie("i18n_redirected", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  // Watch for user changes (login / initial load)
  // We use immediate: true so it checks on hydration too
  watch(
    user,
    async (newUser) => {
      const userId = newUser?.id;

      if (import.meta.dev) {
        console.log("Language Plugin: user check", {
          userId,
          type: typeof userId,
        });
      }

      if (userId) {
        try {
          const { data, error } = await client
            .from("profiles")
            .select("preferred_language")
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Language Plugin: Fetch error", error);
            return;
          }

          if (import.meta.dev) {
            console.log("Language Plugin: Fetched profile", data);
          }

          if (data?.preferred_language) {
            const lang = data.preferred_language;

            if (["en", "hu", "sr"].includes(lang)) {
              // Check value properly (unref if needed, though usually direct access on instance works or .value)
              const current = unref(currentLocale);

              if (current !== lang) {
                if (import.meta.dev) {
                  console.log(
                    `Language Plugin: Switching from ${current} to ${lang}`,
                  );
                }

                // Set cookie
                i18nCookie.value = lang;

                // Set locale
                // setLocale might be async
                await setLocale(lang);

                if (import.meta.dev) {
                  console.log("Language Plugin: Switched.");
                }
              } else {
                if (import.meta.dev) {
                  console.log(
                    "Language Plugin: Already on correct locale",
                    lang,
                  );
                }
                // Ensure cookie is set anyway
                if (i18nCookie.value !== lang) {
                  i18nCookie.value = lang;
                }
              }
            }
          }
        } catch (e) {
          console.error(
            "Language Plugin: Failed to load preferred language",
            e,
          );
        }
      }
    },
    { immediate: true },
  );
});
