<script setup lang="ts">
import type { Database } from "@/types/database.types";

type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];


const { t } = useI18n();

const props = defineProps<{
  modelValue?: Ingredient;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Ingredient): void;
}>();

const supabase = useSupabaseClient<Database>();
const query = ref("");
const ingredients = ref<Ingredient[]>([]);
const isCreating = ref(false);
const showOptions = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const searchIngredients = async (term: string) => {
  if (!term || term.length < 2) {
    ingredients.value = [];
    return;
  }
  
  const { data } = await supabase
    .from("ingredients")
    .select("*")
    .ilike("name", `%${term}%`)
    .limit(10);
    
  ingredients.value = data || [];
};

const handleCreate = async () => {
    if (!query.value) return;
    isCreating.value = true;
    try {
        const { data, error } = await supabase
            .from('ingredients')
            .insert({ name: query.value.trim() })
            .select()
            .single();

        if (error) {
             if (error.code === '23505') { // Unique violation
                 const {data: existing} = await supabase.from('ingredients').select().eq('name', query.value.trim()).single();
                 if (existing) {
                     selectIngredient(existing);
                 }
             } else {
                 alert(t('error_creating_ingredient') + error.message);
             }
        } else if (data) {
            selectIngredient(data);
        }

    } catch (e) {
        console.error(e);
    } finally {
        isCreating.value = false;
    }
}

const selectIngredient = (ingredient: Ingredient) => {
    emit('update:modelValue', ingredient);
    query.value = '';
    showOptions.value = false;
    ingredients.value = [];
};

// Debounce search
let timeout: NodeJS.Timeout;
const handleInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    query.value = val;
    showOptions.value = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => searchIngredients(val), 300);
}

// Close on outside click is hard without a library or extensive listeners.
// Simplification: close on delay blur?
const handleBlur = () => {
    setTimeout(() => {
        showOptions.value = false;
    }, 200);
}
</script>

<template>
  <div class="relative mt-1">
    <div
      class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 sm:text-sm"
    >
      <input
        ref="inputRef"
        class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
        :value="modelValue?.name || query"
        @input="handleInput"
        @focus="showOptions = true"
        @blur="handleBlur"
        :placeholder="$t('search_ingredient_placeholder')"
      />
      <div v-if="modelValue" class="absolute inset-y-0 right-0 flex items-center pr-2">
          <button @click="$emit('update:modelValue', null as any)" class="text-gray-400 hover:text-gray-500">✕</button>
      </div>
    </div>

    <div
      v-if="showOptions && (ingredients.length > 0 || query.length > 1)"
      class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
    >
      <div
        v-if="ingredients.length === 0 && query !== ''"
        class="relative cursor-pointer select-none py-2 px-4 text-gray-700 hover:bg-indigo-50"
        @click="handleCreate"
      >
        <span>{{ $t('nothing_found') }}</span>
       <span class="ml-2 text-indigo-600 font-semibold">
          {{ isCreating ? $t('creating') : $t('create_item', { item: query }) }}
       </span>
      </div>

      <ul v-else>
          <li
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            class="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-indigo-600 hover:text-white text-gray-900"
            @click="selectIngredient(ingredient)"
          >
            <span class="block truncate font-normal">
              {{ ingredient.name }}
            </span>
          </li>
      </ul>
    </div>
  </div>
</template>
