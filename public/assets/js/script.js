var Webcam;
async function initCamera() {
    try {
        Webcam.set({
            width: 1280,
            height: 720,
            image_format: "png",
            jpeg_quality: 100,
            fps: 45,
        });
        Webcam.set('constraints', {
            facingMode: "environment" // environment | user
        });
        Webcam.attach("#webCamera");

        setTimeout(function () {
            $('.fancybox-container').remove();
            $('#webCamera').attr('style', 'width:100% !important;height:100% !important; position: absolute; top: 0;');
            $('.webCamCapture').removeClass('d-none');
        }, 1000);
    } catch (error) {
        console.error('Error initializing camera:', error);
        cuteAlert({
            type: "error",
            title: "Camera Error",
            message: 'Unable to access the camera. Please check your permissions and try again.',
            buttonText: "Ok"
        });
    }
}


function closeWebCam() {
  $('.fancybox-container').remove();
  $('.webCamCapture').addClass('d-none');
  Webcam.reset();
  // Webcam = null;
}

$(document).ready(function () {
  // $("#top-menu-bar ul li a").each(function () {
  //   if ($(this).attr("href") === window.location.href) {
  //     $(this).addClass("passport-scan-text-color-green");
  //   }
  // });
});
$.fancyConfirm = function (opts) {
  opts = $.extend(
    true,
    {
      title: "",
      message: "",
      okButton: "OK",
      noButton: "Cancel",
      callback: $.noop,
    },
    opts || {}
  );

  $.fancybox.open({
    type: "html",
    src:
      '<div class="fc-content">' +
      "<h3>" +
      opts.title +
      "</h3>" +
      "<p>" +
      opts.message +
      "</p>" +
      '<p class="text-right">' +
      '<a data-value="0" data-fancybox-close>' +
      opts.noButton +
      "</a>" +
      '<button data-value="1" data-fancybox-close class="ml-3 btn scan-btn passport-scan-bg-green passport-scan-text-color-white">' +
      opts.okButton +
      "</button>" +
      "</p>" +
      "</div>",
    opts: {
      animationDuration: 350,
      animationEffect: "material",
      modal: true,
      baseTpl:
        '<div class="fancybox-container fc-container" role="dialog" tabindex="-1">' +
        '<div class="fancybox-bg"></div>' +
        '<div class="fancybox-inner">' +
        '<div class="fancybox-stage"></div>' +
        "</div>" +
        "</div>",
      afterClose: function (instance, current, e) {
        var button = e ? e.target || e.currentTarget : null;
        var value = button ? $(button).data("value") : 0;

        opts.callback(value);
      },
    },
  });
};
$.fancyAlert = function (opts) {
  opts = $.extend(
    true,
    {
      title: "",
      message: "",
      okButton: "OK",
      callback: $.noop
    },
    opts || {}
  );

  $.fancybox.open({
    type: "html",
    src:
      '<div class="fc-content">' +
      "<h3>" +
      opts.title +
      "</h3>" +
      "<p>" +
      opts.message +
      "</p>" +
      '<p class="text-center">' +
      '<button data-value="1" data-fancybox-close class="btn scan-btn passport-scan-bg-green passport-scan-text-color-white">' +
      opts.okButton +
      "</button>" +
      "</p>" +
      "</div>",
    opts: {
      animationDuration: 350,
      animationEffect: "material",
      modal: true,
      baseTpl:
        '<div class="fancybox-container fc-container" role="dialog" tabindex="-1">' +
        '<div class="fancybox-bg"></div>' +
        '<div class="fancybox-inner">' +
        '<div class="fancybox-stage"></div>' +
        "</div>" +
        "</div>",
      afterClose: function (instance, current, e) {
        var button = e ? e.target || e.currentTarget : null;
        var value = button ? $(button).data("value") : 0;

        opts.callback(value);
      },
    },
  });
};
// get ajax error status and sent it
function getErrorMessage(jk_err, jk_exc) {
  var msg = "";
  if (jk_err.status === 0) {
    msg = "Not connect. Verify Network.";
  } else if (jk_err.status === 404) {
    msg = "Requested page not found. [404]";
  } else if (jk_err.status === 500) {
    msg = "Internal Server Error [500]";
  } else if (jk_exc === "parsererror") {
    msg = "Request failed.";
  } else if (jk_exc === "timeout") {
    msg = "Time out error.";
  } else if (jk_exc === "abort") {
    msg = "Uncaught Error.";
  } else {
    msg = jk_err.responseText;
  }
  return msg;
}
// convert base64 image to blob file
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

// var ImageURL = e.target.result;
// // Split the base64 string in data and contentType
// var block = ImageURL.split(";");
// // Get the content type
// var contentType = block[0].split(":")[1];// In this case "image/gif"
// // get the real base64 content of the file
// var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."

// // Convert to blob
// var blob = b64toBlob(realData, contentType);

function getLastWeekDates() {
  var fromDate = moment().subtract(1, 'weeks').startOf('week').add(1, 'days').format('DD-MM-YYYY');
  var endDate = moment().subtract(1, 'weeks').endOf('week').add(1, 'days').format('DD-MM-YYYY');
  return {
    fromDate: fromDate,
    endDate: endDate
  }
}
function randomColor() {
  return Math.floor(Math.random() * 16777215).toString(16);
}
var dynamicColors = function () {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ",0.5)";
};

function bindPagination(page, totalRow, url) {
  var firstBtnState = page <= 1 ? 'disabled' : '';
  var previousBtnState = page <= 1 ? 'javascript:;' : baseUrl + `${url}?page=` + (parseInt(page) - 1) + `&per-page=${$('#show-record option:selected').val()}`;
  var disabledFirstLi = page == 1 ? 'disabled' : '';
  var pagination = `<div class="col-12">
                  <ul class="pagination justify-content-end">
                      <li class="page-item ${disabledFirstLi}"><a href="${baseUrl}${url}?page=1&per-page=${$('#show-record option:selected').val()}" class="page-link">First</a></li>
                      <li class="${firstBtnState} page-item">
                          <a href="${previousBtnState}" class="page-link">Prev</a>
                      </li>`;

  var disabledLi = page >= totalRow ? 'disabled' : '';
  var nextPageCount = page >= totalRow ? '' : (parseInt(page ? page : 1) + 1);
  var disabledLastLi = page == totalRow ? 'disabled' : '';

  pagination += ` <li class="${disabledLi} page-item"><a class="page-link" href="${baseUrl}${url}?page=${nextPageCount}&per-page=${$('#show-record option:selected').val()}">Next</a></li>
                  <li class="page-item ${disabledLastLi}"><a class="page-link" href="${baseUrl}${url}?page=${totalRow}&per-page=${$('#show-record option:selected').val()}">Last</a></li></ul>
          </div>`;
  $('.loadPagination').empty().html(pagination);
}
function bindPaginationWithQuery(page, totalRow, url, query) {
  var firstBtnState = page <= 1 ? 'disabled' : '';
  var previousBtnState = page <= 1 ? 'javascript:;' : baseUrl + '${url}?${query}page=' + (parseInt(page) - 1) + `&per-page=${$('#show-record option:selected').val()}`;
  var disabledFirstLi = page == 1 ? 'disabled' : '';
  var pagination = `<div class="col-12">
                  <ul class="pagination justify-content-end">
                      <li class="page-item ${disabledFirstLi}"><a href="${baseUrl}${url}?${query}page=1&per-page=${$('#show-record option:selected').val()}" class="page-link">First</a></li>
                      <li class="${firstBtnState} page-item">
                          <a href="${previousBtnState}" class="page-link">Prev</a>
                      </li>`;

  // for (var i = 1; i <= totalRow; i++) {
  //   var navigateActive = '';
  //   if (page == i) {
  //     navigateActive = 'disabled';
  //   }

  //   pagination += `<li class='page-item ${navigateActive}'><a class='page-link ${navigateActive}' href='${baseUrl}${url}?${query}page=${i}&per-page=${$('#show-record option:selected').val()}'>${i}</a></li>`;

  // }
  var disabledLi = page >= totalRow ? 'disabled' : '';
  var nextPageCount = page >= totalRow ? '' : (parseInt(page) + 1);
  var disabledLastLi = page == totalRow ? 'disabled' : '';

  pagination += ` <li class="${disabledLi} page-item"><a class="page-link" href="${baseUrl}${url}?${query}page=${nextPageCount}&per-page=${$('#show-record option:selected').val()}">Next</a></li>
                  <li class="page-item ${disabledLastLi}"><a class="page-link" href="${baseUrl}${url}?${query}page=${totalRow}&per-page=${$('#show-record option:selected').val()}">Last</a></li></ul>
          </div>`;
  $('.loadPagination').empty().html(pagination);
}

function getTableSerialNumber(page, ind) {
  var currentPage = page;

  // currentPage = currentPage ? currentPage : 1;
  return currentPage ? `${(parseInt(currentPage) * (parseInt(currentPage) - 1))}${(ind + 1)}` : ind + 1;
  // return currentPage ? parseInt((parseInt(currentPage) * (parseInt(currentPage) - 1))+ parseInt(ind + 1) ): ind + 1;
}

$.validator.addMethod("strong_password", function (value, element) {
  let password = value;
  if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?~])(.{8,20}$)/.test(password))) {
    return false;
  }
  return true;
}, function (value, element) {
  let password = $(element).val();
  if (!(/^(?=.*[A-Z])/.test(password))) {
    return 'Password must contain one uppercase.';
  }
  else if (!(/^(?=.*[a-z])/.test(password))) {
    return 'Password must contain one lowercase.';
  }
  else if (!(/^(?=.*[0-9])/.test(password))) {
    return 'Password must contain one number';
  }
  else if (!(/^(?=.*[!@#$%^&*?~])/.test(password))) {
    return "Password must contain special characters from !@#$%^&*?~";
  } else if (!(/^(.{8,20}$)/.test(password))) {
    return 'Password must be 8 to 20 characters';
  }
  return false;
});
$.validator.addMethod("phone_number", function (value, element) {
  let password = value;
  if (!(/^(?=.*[0-9][+ -])/.test(password))) {
    return false;
  }
  return true;
}, "Please enter valid phone number");
$(document).on('click', function (e) {
  $('[data-toggle="popover"],[data-original-title]').each(function () {
    //the 'is' for buttons that trigger popups
    //the 'has' for icons within a button that triggers a popup
    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
      (($(this).popover('hide').data('bs.popover') || {}).inState || {}).click = false  // fix for BS 3.3.6
    }

  });
});

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}