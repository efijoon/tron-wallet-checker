function blockUI(elem) {
  $(elem).block({
    message:
      '<div class="d-flex justify-content-center align-items-center"><p class="mr-50 mb-0">لطفا منتظر بمانید ...</p> <div class="spinner-grow spinner-grow-sm text-white" role="status"></div> </div>',
    css: {
      backgroundColor: "transparent",
      color: "#fff",
      border: "0",
    },
    overlayCSS: {
      opacity: 0.5,
    },
  });
}