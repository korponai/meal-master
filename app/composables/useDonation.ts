export const useDonation = () => {
  const isDonationModalOpen = useState("isDonationModalOpen", () => false);

  const openDonationModal = () => {
    console.log("Opening Donation Modal");
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
