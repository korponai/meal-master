<script setup lang="ts">
import type { Database } from "~/types/database.types";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const { t } = useI18n();

const props = defineProps({
  path: String,
});

const emit = defineEmits(["update:path", "upload"]);

const uploading = ref(false);
const src = ref("");
const files = ref();

const downloadImage = async () => {
  if (!props.path) {
    src.value = "";
    return;
  }
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(props.path);
    if (error) throw error;
    src.value = URL.createObjectURL(data);
  } catch (error: any) {
    console.error("Error downloading image: ", error.message);
  }
};

const uploadAvatar = async (evt: Event) => {
  files.value = (evt.target as HTMLInputElement).files;
  try {
    uploading.value = true;
    if (!files.value || files.value.length === 0) {
      throw new Error("You must select an image to upload.");
    }

    const file = files.value[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    emit("update:path", filePath);
    emit("upload");
  } catch (error: any) {
    alert(error.message);
  } finally {
    uploading.value = false;
  }
};

watch(
  () => props.path,
  () => {
    if (props.path) downloadImage();
  },
);

onMounted(() => {
  if (props.path) downloadImage();
});
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 shadow-md"
    >
      <img
        v-if="src"
        :src="src"
        alt="Avatar"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>
    </div>
    <div class="flex flex-col items-center gap-2">
      <label
        class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
        :class="{ 'opacity-50 cursor-not-allowed': uploading }"
      >
        {{ uploading ? t("uploading") : t("upload_avatar") }}
        <input
          style="visibility: hidden; position: absolute"
          type="file"
          id="single"
          accept="image/*"
          @change="uploadAvatar"
          :disabled="uploading"
        />
      </label>
    </div>
  </div>
</template>
