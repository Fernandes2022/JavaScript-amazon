import {cart, removeFromCart, updateDeliveryOption} from '../data/cart.js';
import {products, getProduct} from '../data/products.js';
import { formatCurrency
 } from './utils/money.js';
import { saveToStorage } from '../data/cart.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryOptions, getDeliveryOption} from '../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';




export function renderOrderSummary(){

  const today = dayjs();
  const deliveryDate = today.add(7, 'days'); 
  console.log(deliveryDate.format('dddd, MMMM, D'));
  
  
   updateCartQuantity();
  function updateCartQuantity(){
    let cartQuantity = 0;
    cart.forEach((item) => {
      cartQuantity += item.quantity;
    })
   
    document.querySelector('.return-to-home-link').innerHTML = `${cartQuantity} items`;
  }

let cartSummary = '';

cart.forEach((item) => {

  const productId = item.productId;

  const matchingProduct = getProduct(productId);

  const deliveryOptionId = item.deliveryOptionId;

  const deliveryOption = getDeliveryOption(deliveryOptionId);

  
    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays, 
      'days'
  ); 
  
    const dateString = deliveryDate.format('dddd, MMMM D');
   
const summaryHtml = `<div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
<div class="delivery-date">
  Delivery date: ${dateString}
</div>

<div class="cart-item-details-grid">
  <img class="product-image"
    src="${matchingProduct.image}">

  <div class="cart-item-details">
    <div class="product-name">
    ${matchingProduct.name}
    </div>
    <div class="product-price">
    $${formatCurrency(matchingProduct.priceCents)}
    </div>
    <div class="product-quantity">
      <span>
        Quantity: <span class="quantity-label label-${matchingProduct.id}">${item.quantity}</span>
      </span>
      <span class="update-quantity-link editing-${matchingProduct.id} link-primary" data-product-id="${matchingProduct.id}">
        Update
      </span>
      <span class="is-edit is-editing-${matchingProduct.id}">
      <input  class="quantity-input edit-${matchingProduct.id}">
      <span class="save-quantity-link link-primary" data-product-id="${matchingProduct.id}">Save</span>
      </span>
      <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
        Delete
      </span>
    </div>
  </div>

  <div class="delivery-options">
    <div class="delivery-options-title">
      Choose a delivery option:
    </div>
    ${deliveryOptionsHTML(matchingProduct, item)}    
  </div>
</div>
</div>
`
 cartSummary += summaryHtml;
});

function deliveryOptionsHTML(matchingProduct, item) {
  let html = '';
  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays, 
      'days'
    ); 
    const dateString = deliveryDate.format('dddd, MMMM D');
    
    const priceString = deliveryOption.priceCents === 0
    ? 'FREE'
    : `$${deliveryOption.priceCents / 100}`;


    const isChecked = deliveryOption.id === item.deliveryOptionId;

    html += `<div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
  <input type="radio"
    class="delivery-option-input"
    ${isChecked ? 'checked' : ''}
    name="delivery-option-${matchingProduct.id}">
  <div>
    <div class="delivery-option-date">
      ${dateString}
    </div>
    <div class="delivery-option-price">
      ${priceString} - Shipping
    </div>
  </div>
</div>
  `
})

return html;
}

document.querySelector('.order-summary').innerHTML = cartSummary;


document.querySelectorAll('.update-quantity-link')
.forEach((update) => {
  update.addEventListener('click', () => {
    const productId = update.dataset.productId;
  
    const updateIn = document.querySelector(`.is-editing-${productId}`);
    updateIn.classList.add('updateIn');
    const updateEdit = document.querySelector(`.editing-${productId}`);
    updateEdit.classList.add('editing');
    updateCartSave();
  })
});

function updateCartSave() {
  document.querySelectorAll('.save-quantity-link')
  .forEach((save) => {
    save.addEventListener('click', () => {
      const productId = save.dataset.productId;
           
      const cartSave = document.querySelector(`.edit-${productId}`);
      const cartSaveHTML = Number(cartSave.value);
      const labelHTML = document.querySelectorAll(`.label-${productId.id}`)
     
     
      let showQuantity = '';
     cart.forEach((item) => {
      if (productId === item.productId){
        showQuantity = item;
      }
    })
    if (showQuantity) {
      showQuantity.quantity = cartSaveHTML;
    }
      cartSave.value = '';
      updateCartQuantity();
      labelHTML.innerHTML = cartSaveHTML;
     console.log(cartSaveHTML)
      saveToStorage();
    })    
  })
}


document.querySelectorAll('.js-delete-link')
.forEach((link) => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);
    
   const container = document.querySelector(`.js-cart-item-container-${productId}`)
   
   container.remove();
   updateCartQuantity();
   renderPaymentSummary();
  })
});

document.querySelectorAll('.js-delivery-option').
forEach((element) => {
  element.addEventListener('click', () => {
    const {productId, deliveryOptionId} = element.dataset;
    updateDeliveryOption(productId, deliveryOptionId);
    renderOrderSummary();
    renderPaymentSummary();
  })
});
}



