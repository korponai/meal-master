<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import { format } from "date-fns";
import type { Database } from "~/types/database.types";

const { t } = useI18n();
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const newItemName = ref("");
const isLoading = ref(false);

type ShoppingListItem = Database['public']['Tables']['shopping_list_items']['Row'];

const { data: items, refresh } = await useAsyncData<ShoppingListItem[]>("shopping-list", async () => {
    const userId = user.value?.id || user.value?.sub;
    const { data } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    return (data as ShoppingListItem[]) || [];
});

const categories: Record<string, { icon: string, labelKey: string }> = {
    'Produce': { icon: '🥬', labelKey: 'shopping_list_category_produce' },
    'Dairy': { icon: '🥛', labelKey: 'shopping_list_category_dairy' },
    'Meat': { icon: '🥩', labelKey: 'shopping_list_category_meat' },
    'Bakery': { icon: '🍞', labelKey: 'shopping_list_category_bakery' },
    'Pantry': { icon: '🥫', labelKey: 'shopping_list_category_pantry' },
    'Frozen': { icon: '❄️', labelKey: 'shopping_list_category_frozen' },
    'Household': { icon: '🧹', labelKey: 'shopping_list_category_household' },
    'Other': { icon: '📦', labelKey: 'shopping_list_category_other' }
};

const groupedItems = computed(() => {
    if (!items.value) return {};
    const groups: Record<string, ShoppingListItem[]> = {};
    
    // Initialize groups order
    Object.keys(categories).forEach(key => {
        groups[key] = [];
    });

    items.value.forEach(item => {
        const cat = item.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
        if (groups[key]?.length === 0) delete groups[key];
    });

    return groups;
});

const progress = computed(() => {
    if (!items.value || items.value.length === 0) return 0;
    const checked = items.value.filter(i => i.is_checked).length;
    return Math.round((checked / items.value.length) * 100);
});

const checkedCount = computed(() => items.value?.filter(i => i.is_checked).length || 0);
const totalCount = computed(() => items.value?.length || 0);

const addItem = async () => {
    if (!newItemName.value.trim()) return;
    isLoading.value = true;
    
    const userId = user.value?.id || user.value?.sub;
    await supabase.from("shopping_list_items").insert({
        user_id: userId,
        name: newItemName.value,
        is_checked: false,
        category: 'Other' // Default category
    });
    
    newItemName.value = "";
    isLoading.value = false;
    refresh();
};

const toggleItem = async (id: string, currentStatus: boolean | null) => {
    // Optimistic update
    const item = items.value?.find(i => i.id === id);
    if (item) item.is_checked = !currentStatus;

    await supabase.from("shopping_list_items").update({ is_checked: !currentStatus }).eq("id", id);
    refresh();
};

const deleteItem = async (id: string) => {
    await supabase.from("shopping_list_items").delete().eq("id", id);
    refresh();
};

const resetList = async () => {
    if (!confirm(t('shopping_list_confirm_uncheck_all'))) return;
    const userId = user.value?.id || user.value?.sub;
    await supabase.from("shopping_list_items").update({ is_checked: false }).eq("user_id", userId);
    refresh();
};

const checkAll = async () => {
     if (!confirm(t('shopping_list_confirm_check_all'))) return;
    const userId = user.value?.id || user.value?.sub;
    await supabase.from("shopping_list_items").update({ is_checked: true }).eq("user_id", userId);
    refresh();
};

</script>

<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('shopping_list_title') }}</h1>
            <p class="text-gray-500">{{ $t('shopping_list_subtitle') }}</p>
        </div>
        <div class="text-sm text-gray-500 hidden sm:block">
            <ClientOnly>
                {{ format(new Date(), 'MMMM d.') }}
            </ClientOnly>
        </div>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 sticky top-4 z-20">
        <div class="flex justify-between items-end mb-2">
            <span class="text-lg font-bold text-gray-900">{{ checkedCount }} / {{ totalCount }} {{ $t('shopping_list_done') }}</span>
            <div class="flex gap-4 text-sm font-medium">
                <button @click="resetList" class="text-gray-400 hover:text-gray-600 transition-colors">{{ $t('shopping_list_reset') }}</button>
                <button @click="checkAll" class="text-blue-600 hover:text-blue-700 transition-colors">{{ $t('shopping_list_check_all') }}</button>
            </div>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2.5">
            <div class="bg-black h-2.5 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
        <!-- Main List -->
        <div class="md:col-span-2 space-y-8">
            <div v-if="totalCount === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <span class="text-4xl block mb-2">🛒</span>
                <p class="text-gray-500">{{ $t('shopping_list_empty_state') }}</p>
            </div>

            <div v-for="(groupItems, category) in groupedItems" :key="category" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <span class="text-xl">{{ categories[category]?.icon || '📦' }}</span>
                    <h3 class="font-bold text-gray-900">{{ categories[category] ? $t(categories[category].labelKey) : category }}</h3>
                    <span class="text-xs font-medium text-gray-400 ml-auto bg-white px-2 py-0.5 rounded-full border border-gray-200">{{ groupItems.length }}</span>
                </div>
                
                <div class="divide-y divide-gray-50">
                    <div 
                        v-for="item in groupItems" 
                        :key="item.id" 
                        class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                        @click="toggleItem(item.id, item.is_checked)"
                    >
                        <div class="flex items-center gap-4">
                            <div 
                                class="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                                :class="item.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-500'"
                            >
                                <svg v-if="item.is_checked" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div class="flex flex-col">
                                <span :class="{'line-through text-gray-400': item.is_checked, 'text-gray-900 font-medium': !item.is_checked, 'transition-colors': true}">
                                    {{ item.name }}
                                </span>
                                <span v-if="item.quantity" class="text-xs text-gray-500">
                                    {{ item.quantity }} {{ item.unit }}
                                </span>
                            </div>
                        </div>
                        
                        <button 
                            @click.stop="deleteItem(item.id)" 
                            class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Add Form -->
        <div class="md:col-span-1">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('shopping_list_quick_add') }}</h2>
                <form @submit.prevent="addItem" class="space-y-3">
                    <input
                        v-model="newItemName"
                        type="text"
                        :placeholder="$t('shopping_list_add_placeholder')"
                        class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-sm"
                    />
                    <button
                        type="submit"
                        :disabled="isLoading || !newItemName.trim()"
                        class="w-full bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                    >
                        {{ $t('shopping_list_add_button') }}
                    </button>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>
