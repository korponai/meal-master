<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { t } = useI18n();
const { openDonationModal } = useDonation();

const { data: profile, refresh } = await useAsyncData("profile", async () => {
  const userId = user.value?.id || user.value?.sub;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
});

// Recipes functionality removed as table does not exist
/*
const { data: recipes } = await useAsyncData("profile-recipes", async () => {
  const userId = user.value?.id || user.value?.sub;
  const { data } = await supabase
    .from("recipes")
    .select("id, title, image_url")
    .eq("user_id", userId)
    .limit(4);
  return data || [];
});
*/

const isEditing = ref(false);
const editForm = ref({
  full_name: "",
  // bio: "", // Not supported
  avatar_url: "",
});
const uploading = ref(false);

import { ALL_SENSITIVITIES } from "@/utils/constants";

const toggleSensitivity = async (sensitivity: string) => {
  if (!profile.value) return;

  const currentSensitivities = profile.value.food_sensitivities || [];
  let newSensitivities: string[];

  if (currentSensitivities.includes(sensitivity)) {
    newSensitivities = currentSensitivities.filter((s) => s !== sensitivity);
  } else {
    newSensitivities = [...currentSensitivities, sensitivity];
  }

  // Optimistic update
  profile.value = {
    ...profile.value,
    food_sensitivities: newSensitivities,
  };

  try {
    const userId = user.value?.id || user.value?.sub;
    const { error } = await supabase
      .from("profiles")
      .update({ food_sensitivities: newSensitivities })
      .eq("id", userId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating sensitivities:", error);
    // Revert optimistic update
    profile.value.food_sensitivities = currentSensitivities;
    alert("Failed to update sensitivity status.");
  }
};

const startEdit = () => {
  editForm.value = {
    full_name: profile.value?.full_name || "",
    // bio: profile.value?.bio || "",
    avatar_url: profile.value?.avatar_url || "",
  };
  isEditing.value = true;
};

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    const fileExt = file.name.split(".").pop();
    const userId = user.value?.id || user.value?.sub;
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);
    editForm.value.avatar_url = publicUrl;
  } catch (error: any) {
    alert(error.message);
  } finally {
    uploading.value = false;
  }
};

const saveProfile = async () => {
  try {
    const userId = user.value?.id || user.value?.sub;
    if (!userId) {
      throw new Error("User ID is missing.");
    }

    const payload = {
      id: userId,
      ...editForm.value,
      updated_at: new Date().toISOString(),
    };

    // check if exists
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert(payload);
      error = insertError;
    }

    if (error) throw error;

    isEditing.value = false;
    refresh();
  } catch (error: any) {
    console.error("Profile save error:", error);
    alert("Error saving profile: " + error.message);
  }
};

const handleSignOut = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};
</script>

<template>
  <div class="pb-20">
    <!-- Banner -->
    <div
      class="h-48 md:h-64 bg-gray-800 rounded-b-3xl relative overflow-hidden"
    >
      <!-- Banner URL not supported
      <img
        v-if="profile?.banner_url"
        :src="profile.banner_url"
        class="w-full h-full object-cover opacity-50"
      />
      -->
      <div
        class="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900"
      ></div>
    </div>

    <div
      class="max-w-7xl mx-auto px-4 md:px-8 relative -mt-16 mb-8 flex flex-col md:flex-row items-end gap-6"
    >
      <!-- Avatar -->
      <div
        class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg relative group"
      >
        <img
          v-if="profile?.avatar_url"
          :src="profile.avatar_url"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-20 h-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-grow pb-4 text-center md:text-left">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ profile?.full_name || $t("default_user_name") }}
        </h1>
        <p class="text-gray-500">{{ $t("member_label") }}</p>
      </div>

      <!-- Actions -->
      <div
        class="pb-4 flex gap-3 w-full md:w-auto justify-center md:justify-end"
      >
        <button
          @click="startEdit"
          class="bg-black text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          {{ $t("edit_profile") }}
        </button>
        <button
          @click="openDonationModal"
          class="bg-[#FFC439] text-black px-6 py-2.5 rounded-full font-semibold hover:bg-[#F4B400] transition-colors"
        >
          {{ $t("donate") }}
        </button>
        <button
          @click="handleSignOut"
          class="border border-gray-300 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
        >
          {{ $t("logout") }}
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="isEditing"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold mb-6">{{ $t("edit_profile") }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{
              $t("avatar_label")
            }}</label>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                <img
                  v-if="editForm.avatar_url"
                  :src="editForm.avatar_url"
                  class="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                :disabled="uploading"
                class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
              />
            </div>
            <p v-if="uploading" class="text-xs text-gray-500 mt-1">
              {{ $t("uploading") }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{
              $t("full_name")
            }}</label>
            <input
              v-model="editForm.full_name"
              type="text"
              class="w-full border rounded-xl px-4 py-2"
            />
          </div>
          <!--
          <div>
            <label class="block text-sm font-medium mb-1">Bio</label>
            <textarea
              v-model="editForm.bio"
              class="w-full border rounded-xl px-4 py-2"
              rows="3"
            ></textarea>
          </div>
          -->
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="isEditing = false"
            class="px-5 py-2.5 border rounded-xl hover:bg-gray-50"
          >
            {{ $t("cancel") }}
          </button>
          <button
            @click="saveProfile"
            :disabled="uploading"
            class="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            {{ $t("save") }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-8">
      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-lg mb-4">{{ $t("profile_details") }}</h3>
          <div class="space-y-3">
            <p v-if="profile?.bio" class="text-gray-600">{{ profile.bio }}</p>
            <p v-else class="text-gray-400 italic">{{ $t("no_bio") }}</p>
          </div>
        </div>

        <!-- Food Sensitivities -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-lg mb-4">
            {{ $t("food_sensitivities_title") }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="sensitivity in ALL_SENSITIVITIES"
              :key="sensitivity"
              class="flex items-center justify-between"
            >
              <span class="text-gray-700">{{
                $t("sensitivity_" + sensitivity)
              }}</span>
              <button
                @click="toggleSensitivity(sensitivity)"
                class="w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out"
                :class="
                  profile?.food_sensitivities?.includes(sensitivity)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                "
              >
                <div
                  class="w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out"
                  :class="
                    profile?.food_sensitivities?.includes(sensitivity)
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  "
                ></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Recipe Gallery Removed -->
      </div>

      <!-- Main Feed / Contributions -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-gray-100 rounded-2xl p-8 text-center text-gray-500">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ $t("recipe_contributions") }}
          </h3>
          <p>{{ $t("activity_feed_placeholder") }}</p>
          <!-- Placeholder for social aspect from mock -->
        </div>
      </div>
    </div>
  </div>
</template>
