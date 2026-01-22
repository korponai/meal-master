<script setup lang="ts">
import type { Database } from "~/types/database.types";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const { t } = useI18n();

const loading = ref(false);
const fullName = ref("");
const username = ref("");
const website = ref("");
const email = ref("");

const props = defineProps<{
  avatarUrl: string;
}>();

const emit = defineEmits(["update:avatarUrl"]);

onMounted(() => {
  if (user.value?.email) {
    email.value = user.value.email;
  }
  getProfile();
});
// ...
// In template
// :value="email"

async function getProfile() {
  if (!user.value?.id) return;
  try {
    loading.value = true;
    const { data, error, status } = await supabase
      .from("profiles")
      .select(`full_name, avatar_url`)
      .eq("id", user.value.id)
      .single();

    if (error && status !== 406) throw error;

    if (data) {
      fullName.value = data.full_name || "";
      emit("update:avatarUrl", data.avatar_url);
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

async function updateProfile() {
  let currentUser = user.value;

  if (!currentUser?.id) {
    console.log("user.value is missing, fetching from auth.getUser()...");
    const { data } = await supabase.auth.getUser();
    currentUser = data.user;
  }

  console.log("Updating profile...", currentUser?.id);
  if (!currentUser?.id) {
    console.error("User ID missing even after check");
    alert(
      "User interaction error: You appear to be logged out. Please reload the page.",
    );
    return;
  }
  try {
    loading.value = true;
    const updates = {
      id: currentUser.id,
      full_name: fullName.value,
      updated_at: new Date().toISOString(),
    };
    console.log("Payload:", updates);

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      console.error("Upsert error:", error);
      throw error;
    }
    console.log("Profile updated successfully");
    alert(t("profile_updated"));
  } catch (error: any) {
    console.error("Catch error:", error);
    alert(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="updateProfile" class="space-y-6">
    <div>
      <label
        for="email"
        class="block text-sm font-medium leading-6 text-gray-900"
        >{{ t("email") }}</label
      >
      <div class="mt-2">
        <input
          id="email"
          type="text"
          :value="email"
          disabled
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </div>

    <div>
      <label
        for="fullName"
        class="block text-sm font-medium leading-6 text-gray-900"
        >{{ t("full_name") }}</label
      >
      <div class="mt-2">
        <input
          id="fullName"
          type="text"
          v-model="fullName"
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
        />
      </div>
    </div>

    <div>
      <button
        type="submit"
        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? t("loading") : t("update") }}
      </button>
    </div>
  </form>
</template>
