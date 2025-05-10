/**
 * TheMoak Virtual Try-on Admin Script
 */
(function ($) {
  'use strict';

  // Initialize color picker
  $('.color-picker').wpColorPicker();

  // Button icon selection
  $('#button_icon').on('change', function () {
    const iconClass = $(this).val();
    $('.icon-preview .dashicons').attr('class', 'dashicons ' + iconClass);
  });

  // Handle bulk actions for products
  $('#doaction').on('click', function (e) {
    e.preventDefault();

    const action = $('#bulk-action-selector-top').val();

    if (action === '-1') {
      alert(themoak_tryon_params.messages.select_action);
      return;
    }

    const selectedProducts = $('#the-list input[type="checkbox"]:checked');

    if (selectedProducts.length === 0) {
      alert(themoak_tryon_params.messages.select_products);
      return;
    }

    const productIds = [];
    selectedProducts.each(function () {
      productIds.push($(this).val());
    });

    // Confirm action
    if (!confirm(themoak_tryon_params.messages.confirm_bulk_action)) {
      return;
    }

    const ajaxAction =
      action === 'enable'
        ? 'themoak_tryon_enable_product'
        : 'themoak_tryon_disable_product';

    // Process each product
    selectedProducts.each(function () {
      const productId = $(this).val();
      const row = $('tr[data-id="' + productId + '"]');
      const toggleCheckbox = row.find('.tryon-toggle');

      $.ajax({
        url: themoak_tryon_params.ajax_url,
        type: 'POST',
        data: {
          action: ajaxAction,
          nonce: themoak_tryon_params.nonce,
          product_id: productId,
        },
        beforeSend: function () {
          row.css('opacity', '0.5');
        },
        success: function (response) {
          row.css('opacity', '1');

          if (response.success) {
            if (action === 'enable') {
              row.removeClass('tryon-disabled').addClass('tryon-enabled');
              toggleCheckbox.prop('checked', true);
            } else {
              row.removeClass('tryon-enabled').addClass('tryon-disabled');
              toggleCheckbox.prop('checked', false);
            }
          }
        },
        error: function () {
          row.css('opacity', '1');
        },
      });
    });
  });

  // Select all checkboxes
  $('#cb-select-all').on('change', function () {
    const isChecked = $(this).prop('checked');
    $('#the-list input[type="checkbox"]').prop('checked', isChecked);
  });

  // Search functionality
  $('#product-search').on('keyup', function () {
    const searchTerm = $(this).val().toLowerCase();

    $('#the-list tr').each(function () {
      const productName = $(this).find('.column-name a').text().toLowerCase();
      const productSku = $(this).find('.column-sku').text().toLowerCase();

      if (
        productName.indexOf(searchTerm) > -1 ||
        productSku.indexOf(searchTerm) > -1
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });
})(jQuery);
// Add the following to your existing admin.js file:
jQuery(document).ready(function ($) {
  // Get the modal
  var modal = $('#themoak-adjustment-modal');

  // When user clicks on Adjust button
  $('.adjust-glasses-settings').on('click', function () {
    var productId = $(this).data('product-id');
    $('#adjustment_product_id').val(productId);

    // Load existing values via AJAX
    $.ajax({
      url: themoak_tryon_params.ajax_url,
      type: 'GET',
      data: {
        action: 'themoak_get_product_adjustments',
        product_id: productId,
        nonce: themoak_tryon_params.nonce,
      },
      success: function (response) {
        if (response.success) {
          // Fill form with existing values
          $.each(response.data, function (key, value) {
            $('#' + key).val(value);
          });

          // Show the modal
          modal.fadeIn(300);
        }
      },
    });
  });

  // Close the modal
  $('.themoak-modal-close').on('click', function () {
    modal.fadeOut(300);
  });

  // Close modal on click outside
  $(window).on('click', function (e) {
    if ($(e.target).is(modal)) {
      modal.fadeOut(300);
    }
  });

  // Reset to defaults
  $('.themoak-reset-defaults').on('click', function (e) {
    e.preventDefault();

    // Clear all inputs
    $('#themoak-adjustments-form input[type="number"]').val('');
  });

  // Save adjustments
  $('#themoak-adjustments-form').on('submit', function (e) {
    e.preventDefault();

    $.ajax({
      url: themoak_tryon_params.ajax_url,
      type: 'POST',
      data: $(this).serialize() + '&action=themoak_save_product_adjustments',
      success: function (response) {
        if (response.success) {
          modal.fadeOut(300);
          // Show success message
          alert(response.data.message);
        }
      },
    });
  });
});
