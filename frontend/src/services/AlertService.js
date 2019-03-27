import swal from 'sweetalert2'

const AlertService = {
  swal: swal,
  loadingPopup: () => {
    AlertService.swal({
        title: 'Loading',
        onBeforeOpen: () => {
            AlertService.swal.showLoading()
        },
      showConfirmButton: false,
      allowOutsideClick: false
    })
  },

  __showPopup: (config, cb) => {
    if (cb) {
      swal(config).then(cb)
    } else {
      swal(config)
    }
  }
}

export default AlertService
