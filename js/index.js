let user;
let products;
let cart;

const productContainer = document.querySelector(".content");
const cartProductsContainer = document.querySelector(".cart__products");
const cartContainer = document.querySelector(".cart");
const btnCheckout = document.querySelector(".cart__checkout");

function getData(url) {
	return new Promise((res, rej) => {
		fetch(url)
			.then((res) => res.json())
			.then((data) => res(data));
	});
}

function joinTemplate(arr, templateFn, join = false) {
	const newArr = arr.map((el) => templateFn(el));
	if (join) return newArr.join("");
	return newArr;
}

function renderHTML(parentEl, HTML, position, clean = false) {
	clean ? (parentEl.innerHTML = "") : "";
	return parentEl.insertAdjacentHTML(position, HTML);
}

function createThumbnailImagesHTML(arr, preview = false) {
	const newDots = arr.map(
		(image, i) =>
			`
		<div class="${preview ? "image-preview__thumbnail-image" : "image__thumbnail-image"}" data-slide="${i}">
			<img src="${image}" data-slide="${i}" class="${preview ? "image-preview__thumbnail-img" : "image__thumbnail-img"}"/>
		</div>
	`
	);
	return newDots;
}

function createMainPreviewImageHTML(img, preview = false) {
	return `
		<div class="${preview ? "image-preview__slide" : "slide"}">
			<img class="${preview ? "image-preview__slide-img" : "slide-img"}" src="${img}" alt="Image of the product" />
		</div>
	`;
}

function createImagePreviewTemplate({ thumbnails, jpgs }) {
	return `
	<div class="image-preview">
		<button class="btn-close"><img class="btn-close-img" src="/images/icon-close.svg" alt="Icond of the closing the preview"></button>
		<button class="btn-prev"><img class="btn-prev-img" src="/images/icon-previous.svg" alt="Icon of the next slide" /></button>
		<div class="image-preview__main-images">
			${jpgs.map((img) => createMainPreviewImageHTML(img, true)).join("")}
			</div>
		<button class="btn-next"><img class="btn-next-img" src="/images/icon-next.svg" alt="Icon of the next slide" /></button>
	
		<div class="image-preview__thumbnail-images">	
			${createThumbnailImagesHTML(thumbnails, true).join("")}
		</div>
	</div>
	<div class="overlay"></div>
	`;
}

function createProductPageHTML(data) {
	return `
            <div class="image">
				<div class="image__main-images">
					${joinTemplate(data.images.jpgs, createMainPreviewImageHTML, true)}
				</div>
				
				<div class="image__thumbnail-images">	
					${createThumbnailImagesHTML(data.images.thumbnails).join("")}
				</div>
			</div>

			<div class="product" id="${data.id}">
				<p class="product__company">${data.company}</p>
				<h1 class="heading-primary product__name">${data.name}</h1>
				<p class="product__description">${data.description}</p>
				<div class="product__price-box">
					<p class="product__discount-price">$${data.discountPrice.toFixed(2)}</p>
					<p class="product__discount">${data.discount}%</p>
				</div>
				<p class="product__price">$${data.price.toFixed(2)}</p>

				<div class="product__purchase">
					<div class="product__qnt-box">
						<img src="images/icon-minus.svg" alt="Image of the Menus" class="btn--decrement-qnt"/>
						<p class="product__qnt">${data.quantity}</p>
						<img src="images/icon-plus.svg" alt="Image of the Plus" class="btn--increment-qnt"/>
					</div>

					<button class="btn btn-purchase"><img src="images/icon-cart.svg" alt="" /> Add To Cart</button>
				</div>
			</div>
    `;
}

function createCartProductHTML(data) {
	return `
		<div class="cart-product" id="${data.id}">
			<img
				src="${data.image}"
				alt="Image of the product"
				class="cart-product__img"
			/>

			<div class="cart-product__info">
				<p class="cart-product__name">${data.name}</p>

				<div class="cart-product__quantity-box">
					<span class="cart-product__price">$${data.price}</span> x
					<span class="cart-product__qnt">${data.quantity}</span>
					<strong class="cart-product__final-price">$${data.totalPrice}</strong>
				</div>
			</div>
			
			<div class="btn btn-delete">
				<img class="btn-delete-img" src="images/icon-delete.svg" alt="Image of the delete icon" />
			</div>
		</div>
	`;
}

function createProductObj(id, name, price, quantity, image) {
	return {
		id,
		name,
		price: price.toFixed(2),
		quantity,
		image,
		totalPrice: (price * quantity).toFixed(2),
	};
}

function checkIfCartIsEmpty(cart) {
	if (!cart.length) {
		btnCheckout.classList.add("content--hidden");
		return renderHTML(
			cartProductsContainer,
			`<p class="cart__empty-text">Your Cart Is Empty</p>`,
			"afterbegin",
			true
		);
	}

	btnCheckout.classList.remove("content--hidden");
	return renderHTML(cartProductsContainer, joinTemplate(cart, createCartProductHTML, true), "afterbegin", true);
}

function changeQntOfProduct(product, type, el) {
	if (type === "increment") {
		product.quantity++;
		el.textContent = product.quantity;
	}

	if (product.quantity <= 0) return;

	if (type === "decrement") {
		product.quantity--;
		el.textContent = product.quantity;
	}
}

function deleteProductFromCartById(id, arr) {
	for (let i = 0; i < arr.length; i++) {
		if (id === arr[i].id) {
			arr.splice(i, 1);
			break;
		}
	}
	return null;
}

function slider({ slide, dots, dot, img }) {
	const slides = document.querySelectorAll(slide);
	const dotContainer = document.querySelector(dots);

	let curSlide = 0;
	const maxSlide = slides.length;

	function activateDot(slide) {
		document.querySelectorAll(dot).forEach((image) => image.classList.remove("image--active"));

		return document.querySelector(`${dot}[data-slide="${slide}"]`).classList.add("image--active");
	}

	function goToSlide(slide) {
		return slides.forEach((s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`));
	}

	function nextSlide() {
		if (curSlide === maxSlide - 1) curSlide = 0;
		else curSlide++;

		goToSlide(curSlide);
		return activateDot(curSlide);
	}

	function prevSlide() {
		if (curSlide === 0) curSlide = maxSlide - 1;
		else curSlide--;

		goToSlide(curSlide);
		return activateDot(curSlide);
	}

	function init() {
		goToSlide(0);
		return activateDot(0);
	}
	init();

	// Event Handlers
	dotContainer.addEventListener("click", (e) => {
		const { target } = e;
		if (target.matches(img)) {
			const {
				dataset: { slide },
			} = target;

			goToSlide(slide);
			return activateDot(slide);
		}
	});

	document.body.addEventListener("click", (e) => {
		const { target } = e;

		if (target.matches(".btn-prev") || target.matches(".btn-prev-img")) prevSlide();

		if (target.matches(".btn-next") || target.matches(".btn-next-img")) nextSlide();
	});
}

getData("/data.json").then((data) => {
	user = data.user;
	products = data.products;
	cart = user.cart;

	checkIfCartIsEmpty(cart.products);
	renderHTML(productContainer, joinTemplate(products, createProductPageHTML, true), "afterbegin");
	renderHTML(document.body, createImagePreviewTemplate(products[0].images), "afterbegin");
	return slider({
		slide: ".slide",
		dots: ".image__thumbnail-images",
		dot: ".image__thumbnail-image",
		img: ".image__thumbnail-img",
	});
});

function addingProductsToCart(product, id) {
	// Check If product quantity is 0
	if (product.quantity <= 0) {
		// If it is 0 then remove it from Array
		deleteProductFromCartById(product.id, cart.products);

		// Update DOM
		return checkIfCartIsEmpty(cart.products);
	}

	// Create new Cart Product Object
	const newObj = createProductObj(
		product.id,
		product.name,
		product.discountPrice,
		product.quantity,
		product.images.thumbnails[0]
	);

	// Check If it is already in Array
	if (cart.products.some((obj) => obj.id === newObj.id)) {
		const prod = cart.products.find((obj) => obj.id === id);

		// If it is just update the Qnt and TotalPrice
		prod.quantity = newObj.quantity;
		prod.totalPrice = newObj.totalPrice;

		// Update DOM
		return checkIfCartIsEmpty(cart.products);
	}

	// If it is not in the Array Just add it and Update the DOM
	cart.products.push(newObj);
	return checkIfCartIsEmpty(cart.products);
}

document.body.addEventListener("click", (e) => {
	const { target } = e;
	const qntContainer = document.querySelector(".product__qnt");
	// Handle the Cart Display State
	if (target.matches(".header__cart-img")) return cartContainer.classList.toggle("cart--active");

	// Handle Decrementing the quantity of the Product
	if (target.matches(".btn--decrement-qnt")) {
		const { id } = target.closest(".product");
		const product = products.find((obj) => obj.id === id);
		return changeQntOfProduct(product, "decrement", qntContainer);
	}

	// Handle Incrementing the quantity of the Product
	if (target.matches(".btn--increment-qnt")) {
		const { id } = target.closest(".product");
		const product = products.find((obj) => obj.id === id);
		return changeQntOfProduct(product, "increment", qntContainer);
	}

	// Handle Adding Products To Cart
	if (target.matches(".btn-purchase")) {
		const { id } = target.closest(".product");
		const product = products.find((obj) => obj.id === id);
		return addingProductsToCart(product, id);
	}

	// Handle Deleting Product from the Cart
	if (target.matches(".btn-delete-img")) {
		const { id } = target.closest(".cart-product");
		deleteProductFromCartById(id, cart.products);
		return checkIfCartIsEmpty(cart.products);
	}

	// Handle Preview
	if (target.matches(".slide-img")) {
		const imagePreviewContainer = document.querySelector(".image-preview");
		imagePreviewContainer.classList.add("content--active");

		return slider({
			slide: ".image-preview__slide",
			dots: ".image-preview__thumbnail-images",
			dot: ".image-preview__thumbnail-image",
			img: ".image-preview__thumbnail-img",
		});
	}

	// Handle Closing of the Preview Modal
	if (target.matches(".btn-close") || target.matches(".btn-close-img")) {
		const imagePreviewContainer = document.querySelector(".image-preview");
		return imagePreviewContainer.classList.remove("content--active");
	}
});

// Clsoing the Preview Modal using Escape Key
document.body.addEventListener("keydown", (e) => {
	const { key } = e;
	if (key === "Escape") {
		const imagePreviewContainer = document.querySelector(".image-preview");
		return imagePreviewContainer.classList.remove("content--active");
	}
});
