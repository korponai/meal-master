<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const newItemName = ref("");
const isLoading = ref(false);

const { data: items, refresh } = await useAsyncData("shopping-list", async () => {
    const userId = user.value?.id || user.value?.sub;
    const { data } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    return data || [];
});

const addItem = async () => {
    if (!newItemName.value.trim()) return;
    isLoading.value = true;
    
    // Parse quantity if possible (simple regex)
    // For now simple text
    const userId = user.value?.id || user.value?.sub;
    await supabase.from("shopping_list_items").insert({
        user_id: userId,
        name: newItemName.value,
        is_checked: false
    });
    
    newItemName.value = "";
    isLoading.value = false;
    refresh();
};

const toggleItem = async (id: string, currentStatus: boolean) => {
    await supabase.from("shopping_list_items").update({ is_checked: !currentStatus }).eq("id", id);
    refresh();
};

const deleteItem = async (id: string) => {
    await supabase.from("shopping_list_items").delete().eq("id", id);
    refresh();
};
</script>

<template>
  <div class="grid md:grid-cols-3 gap-12">
    <!-- Left Column: List -->
    <div class="md:col-span-2 space-y-6">
        <h1 class="text-3xl font-bold text-gray-900">Shopping List</h1>
        
        <div class="bg-gray-50 rounded-2xl p-6 min-h-[400px]">
            <div v-if="items?.length === 0" class="text-center text-gray-500 py-12">
                Your shopping list is empty.
            </div>
            
            <ul class="space-y-4">
                <li v-for="item in items" :key="item.id" class="flex items-center justify-between group p-2 hover:bg-white rounded-xl transition-colors">
                    <div class="flex items-center gap-4">
                        <button 
                            @click="toggleItem(item.id, item.is_checked)"
                            class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                            :class="item.is_checked ? 'bg-black border-black' : 'border-gray-300 hover:border-black'"
                        >
                            <svg v-if="item.is_checked" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <span :class="{'line-through text-gray-400': item.is_checked, 'text-gray-900 font-medium': !item.is_checked}">
                            {{ item.name }} {{ item.quantity ? `(${item.quantity} ${item.unit || ''})` : '' }}
                        </span>
                    </div>
                    
                    <button @click="deleteItem(item.id)" class="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Delete
                    </button>
                </li>
            </ul>
        </div>
    </div>

    <!-- Right Column: Add Form -->
    <div class="md:col-span-1">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Add Items</h2>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <form @submit.prevent="addItem" class="space-y-4">
                <input
                    v-model="newItemName"
                    type="text"
                    placeholder="Add new item"
                    class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3"
                />
                <button
                    type="submit"
                    :disabled="isLoading || !newItemName.trim()"
                    class="w-full bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    Add Item
                </button>
            </form>
        </div>
    </div>
  </div>
</template>
