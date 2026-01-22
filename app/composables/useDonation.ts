export const useDonation = () => {
  const isDonationModalOpen = useState("isDonationModalOpen", () => false);

  const openDonationModal = () => {
    isDonationModalOpen.value = true;
  };

  const closeDonationModal = () => {
    isDonationModalOpen.value = false;
  };

  return {
    isDonationModalOpen,
    openDonationModal,
    closeDonationModal,
  };
};
