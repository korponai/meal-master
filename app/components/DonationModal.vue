<script setup lang="ts">
const { isDonationModalOpen, closeDonationModal } = useDonation();
const { t } = useI18n();
const config = useRuntimeConfig();

const options = [
  { id: "beer", price: "5.00", label: "option_beer", icon: "🍺" },
  { id: "pizza", price: "15.00", label: "option_pizza", icon: "🍕" },
  { id: "massage", price: "30.00", label: "option_massage", icon: "💆" },
];

const selectedOption = ref(options[0]);
const containerId = "paypal-button-container";
const sdkLoaded = ref(false);

const selectOption = (option: (typeof options)[0]) => {
  selectedOption.value = option;
  renderPayPalButton();
};

const loadPayPalScript = () => {
  if (sdkLoaded.value) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    if (document.getElementById("paypal-sdk")) {
      sdkLoaded.value = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${config.public.paypalClientId}&currency=EUR`;
    script.onload = () => {
      sdkLoaded.value = true;
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const renderPayPalButton = async () => {
  if (!sdkLoaded.value) await loadPayPalScript();

  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";

  // @ts-ignore
  if (window.paypal && selectedOption.value) {
    // @ts-ignore
    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: selectedOption.value.price,
                },
              },
            ],
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            alert("Transaction completed by " + details.payer.name.given_name);
            closeDonationModal();
          });
        },
      })
      .render(`#${containerId}`);
  }
};

watch(
  isDonationModalOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        renderPayPalButton();
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="isDonationModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
  >
    <div
      class="fixed inset-0 bg-black/50 transition-opacity"
      @click="closeDonationModal"
    ></div>

    <div
      class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
    >
      <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
        <button
          type="button"
          class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="closeDonationModal"
        >
          <span class="sr-only">Close</span>
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="sm:flex sm:items-start">
        <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
          <h3
            class="text-xl font-semibold leading-6 text-gray-900"
            id="modal-title"
          >
            {{ t("donate_title") }}
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500 mb-6">{{ t("donate_desc") }}</p>

            <div class="grid grid-cols-1 gap-4 mb-6">
              <div
                v-for="option in options"
                :key="option.id"
                @click="selectOption(option)"
                :class="[
                  selectedOption?.id === option.id
                    ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400',
                  'relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none',
                ]"
              >
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <span class="block text-sm font-medium text-gray-900">
                      {{ option.icon }} {{ t(option.label) }}
                    </span>
                    <span class="mt-1 flex items-center text-sm text-gray-500">
                      {{ option.price }} EUR
                    </span>
                  </span>
                </span>
                <svg
                  v-if="selectedOption?.id === option.id"
                  class="h-5 w-5 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div
              id="paypal-button-container"
              class="w-full min-h-[150px] flex justify-center items-center bg-gray-50 rounded"
            >
              <span v-if="!sdkLoaded" class="text-gray-400 text-sm"
                >Loading PayPal...</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
