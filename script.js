// Պահպանում է ընթացիկ պատվերն, հաստատված պատվերները, առաքման պատվերները և արխիվը
let currentOrder = [];
let confirmedOrders = JSON.parse(localStorage.getItem('confirmedSushiOrders')) || [];
let deliveryOrders = JSON.parse(localStorage.getItem('deliverySushiOrders')) || [];
let archivedOrders = JSON.parse(localStorage.getItem('archivedSushiOrders')) || [];
let editingOrderIndex = null;
let editingOrderData = null;

// Գները սուշիի տեսակների համար
const prices = {
    'California Roll': 2000,
    'Spicy Tuna Roll': 2500,
    'Salmon Nigiri': 1800,
    'Dragon Roll': 3000
};

// Թարմացնել նավիգացիոն մենյուի badge-երը
function updateNavCounts() {
    document.getElementById('new-order-count').textContent = confirmedOrders.length;
    document.getElementById('delivery-count').textContent = deliveryOrders.length;
    document.getElementById('archive-count').textContent = archivedOrders.length;
}

// Հաշվարկել ընդհանուր գումարը
function calculateTotal(orderItems, deliveryFee = 0) {
    const itemsTotal = orderItems.reduce((total, item) => total + (item.quantity * prices[item.type]), 0);
    return itemsTotal + deliveryFee;
}

// Ցուցադրել ընթացիկ պատվերի ապրանքները
function displayCurrentOrder() {
    const orderList = document.getElementById('current-order-items');
    const totalDisplay = document.getElementById('current-order-total');
    orderList.innerHTML = '';
    currentOrder.forEach((item, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <div class="order-header">
                ${item.type} - ${item.quantity} հատ (Ընդհանուր: ${item.quantity * prices[item.type]} դրամ)
                <i class="fas fa-trash delete-icon" onclick="deleteFromCurrentOrder(${index})"></i>
            </div>
        `;
        orderList.appendChild(orderDiv);
    });
    totalDisplay.innerHTML = currentOrder.length > 0 ? `Ընդհանուր: ${calculateTotal(currentOrder)} դրամ` : '';
}

// Ցուցադրել հաստատված պատվերները
function displayConfirmedOrders() {
    const confirmedList = document.getElementById('confirmed-orders');
    confirmedList.innerHTML = '';
    confirmedOrders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'confirmed-order';
        let orderDetails = `
            <div class="order-header">
                <strong>Պատվեր #${index + 1}</strong> (${order.name}, <a href="tel:+374${order.phone}">0${order.phone}</a>, ${order.address})
                <i class="fas fa-trash delete-icon" onclick="deleteOrder(${index})"></i>
            </div>
            <p><strong>Ամսաթիվ:</strong> ${order.orderDate}</p>
            <p><strong>Մարդկանց քանակ:</strong> ${order.people}</p>
            <p><strong>Նկարագրություն:</strong> ${order.description || 'Չկա'}</p>
        `;
        order.items.forEach(item => {
            orderDetails += `
                ${item.type} - ${item.quantity} հատ (Ընդհանուր: ${item.quantity * prices[item.type]} դրամ)<br>
            `;
        });
        orderDetails += `<div class="total">Ընդհանուր: ${calculateTotal(order.items, order.deliveryFee || 0)} դրամ ${order.deliveryFee ? `(Առաքման վճար: ${order.deliveryFee} դրամ)` : ''}</div>`;
        orderDiv.innerHTML = `
            ${orderDetails}
            <div class="order-commands">
                <button class="print-btn" onclick="editOrder(${index})"><i class="fas fa-edit"></i> Խմբագրել</button>
                <button class="print-btn" onclick="printOrder(${index}, 'confirmed')"><i class="fas fa-print"></i> Տպել</button>
                <button class="send-btn" onclick="sendOrder(${index})"><i class="fas fa-paper-plane"></i> Ուղարկել Պատվերը</button>
            </div>
        `;
        confirmedList.appendChild(orderDiv);
    });
    updateNavCounts();
}

// Ցուցադրել առաքման պատվերները
function displayDeliveryOrders() {
    const deliveryList = document.getElementById('delivery-orders');
    deliveryList.innerHTML = '';
    deliveryOrders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'delivery-order';
        let orderDetails = `
            <div class="order-header">
                <strong>Պատվեր #${index + 1}</strong> (${order.name}, <a href="tel:+374${order.phone}">0${order.phone}</a>, ${order.address})
            </div>
            <p><strong>Ամսաթիվ:</strong> ${order.orderDate}</p>
            <p><strong>Մարդկանց քանակ:</strong> ${order.people}</p>
            <p><strong>Նկարագրություն:</strong> ${order.description || 'Չկա'}</p>
        `;
        order.items.forEach(item => {
            orderDetails += `${item.type} - ${item.quantity} հատ (Ընդհանուր: ${item.quantity * prices[item.type]} դրամ)<br>`;
        });
        orderDetails += `<div class="total">Ընդհանուր: ${calculateTotal(order.items, order.deliveryFee || 0)} դրամ ${order.deliveryFee ? `(Առաքման վճար: ${order.deliveryFee} դրամ)` : ''}</div>`;
        orderDiv.innerHTML = `
            ${orderDetails}
            <button class="confirm-delivery-btn" onclick="confirmDelivery(${index})"><i class="fas fa-check"></i> Հաստատել առաքումը</button>
        `;
        deliveryList.appendChild(orderDiv);
    });
    updateNavCounts();
}

// Ցուցադրել արխիվացված պատվերները
function displayArchivedOrders() {
    const archiveList = document.getElementById('archive-orders');
    archiveList.innerHTML = '';
    archivedOrders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'archive-order';
        let orderDetails = `
            <div class="order-header">
                <strong>Արխիվ #${index + 1}</strong> (${order.name}, <a href="tel:+374${order.phone}">0${order.phone}</a>, ${order.address})
            </div>
            <p><strong>Ամսաթիվ:</strong> ${order.orderDate}</p>
            <p><strong>Մարդկանց քանակ:</strong> ${order.people}</p>
            <p><strong>Նկարագրություն:</strong> ${order.description || 'Չկա'}</p>
        `;
        order.items.forEach(item => {
            orderDetails += `${item.type} - ${item.quantity} հատ (Ընդհանուր: ${item.quantity * prices[item.type]} դրամ)<br>`;
        });
        orderDetails += `<div class="total">Ընդհանուր: ${calculateTotal(order.items, order.deliveryFee || 0)} դրամ ${order.deliveryFee ? `(Առաքման վճար: ${order.deliveryFee} դրամ)` : ''}</div>`;
        orderDiv.innerHTML = orderDetails;
        archiveList.appendChild(orderDiv);
    });
    updateNavCounts();
}

// Ավելացնել ապրանք ընթացիկ պատվերին
function addToCurrentOrder() {
    const sushiType = document.getElementById('sushi-type').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    if (quantity > 0) {
        currentOrder.push({type: sushiType, quantity: quantity});
        displayCurrentOrder();
    } else {
        alert('Խնդրում ենք մուտքագրել վավեր քանակ:');
    }
}

// Հեռացնել ապրանք ընթացիկ պատվերից
function deleteFromCurrentOrder(index) {
    currentOrder.splice(index, 1);
    displayCurrentOrder();
}

// Հեռացնել ամբողջ պատվերը հաստատված պատվերներից
function deleteOrder(index) {
    confirmedOrders.splice(index, 1);
    localStorage.setItem('confirmedSushiOrders', JSON.stringify(confirmedOrders));
    displayConfirmedOrders();
}

// Խմբագրել հաստատված պատվեր
function editOrder(index) {
    editingOrderIndex = index;
    const order = confirmedOrders[index];
    currentOrder = [...order.items];
    editingOrderData = {
        phone: order.phone,
        name: order.name,
        address: order.address,
        people: order.people,
        description: order.description,
        deliveryFee: order.deliveryFee || 0
    };
    confirmedOrders.splice(index, 1);
    localStorage.setItem('confirmedSushiOrders', JSON.stringify(confirmedOrders));

    // Լրացնել մոդալի դաշտերը
    document.getElementById('order-phone').value = order.phone;
    document.getElementById('order-name').value = order.name;
    document.getElementById('order-address').value = order.address;
    document.getElementById('order-people').value = order.people;
    document.getElementById('order-description').value = order.description || '';
    document.getElementById('delivery-checkbox').checked = !!order.deliveryFee;
    document.getElementById('delivery-fee').style.display = order.deliveryFee ? 'block' : 'none';
    document.getElementById('delivery-fee').value = order.deliveryFee || 0;

    // Փոխել մոդալի վերնագիրը
    document.querySelector('.modal-content h3').textContent = 'Խմբագրել Պատվերը';

    displayCurrentOrder();
    displayConfirmedOrders();
}

// Բացել մոդալը
function openModal() {
    if (currentOrder.length > 0) {
        // Եթե խմբագրում ենք, օգտագործել պահված տվյալները
        if (editingOrderData) {
            document.getElementById('order-phone').value = editingOrderData.phone;
            document.getElementById('order-name').value = editingOrderData.name;
            document.getElementById('order-address').value = editingOrderData.address;
            document.getElementById('order-people').value = editingOrderData.people || 1;
            document.getElementById('order-description').value = editingOrderData.description || '';
            document.getElementById('delivery-checkbox').checked = !!editingOrderData.deliveryFee;
            document.getElementById('delivery-fee').style.display = editingOrderData.deliveryFee ? 'block' : 'none';
            document.getElementById('delivery-fee').value = editingOrderData.deliveryFee || 0;
            document.querySelector('.modal-content h3').textContent = 'Հաստատել Խմբագրված Պատվերը';
        } else {
            // Նոր պատվերի համար մաքրել դաշտերը
            document.getElementById('order-phone').value = '';
            document.getElementById('order-name').value = '';
            document.getElementById('order-address').value = '';
            document.getElementById('order-people').value = 1;
            document.getElementById('order-description').value = '';
            document.getElementById('delivery-checkbox').checked = false;
            document.getElementById('delivery-fee').style.display = 'none';
            document.getElementById('delivery-fee').value = 0;
            document.querySelector('.modal-content h3').textContent = 'Հաստատել Պատվերը';
        }
        document.getElementById('order-modal').style.display = 'flex';
    } else {
        alert('Խնդրում ենք ավելացնել գոնե մեկ ապրանք պատվերին:');
    }
}

// Փակել մոդալը
function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('order-phone').value = '';
    document.getElementById('order-name').value = '';
    document.getElementById('order-address').value = '';
    document.getElementById('order-people').value = 1;
    document.getElementById('order-description').value = '';
    document.getElementById('delivery-checkbox').checked = false;
    document.getElementById('delivery-fee').style.display = 'none';
    document.getElementById('delivery-fee').value = 0;
    editingOrderIndex = null;
    editingOrderData = null;
}

// Հաստատել պատվերը մոդալի տվյալներով
function submitOrderDetails() {
    const phone = document.getElementById('order-phone').value;
    const name = document.getElementById('order-name').value;
    const address = document.getElementById('order-address').value;
    const people = parseInt(document.getElementById('order-people').value);
    const description = document.getElementById('order-description').value;
    const isDelivery = document.getElementById('delivery-checkbox').checked;
    const deliveryFee = isDelivery ? parseInt(document.getElementById('delivery-fee').value) || 0 : 0;
    const orderDate = new Date().toLocaleString('hy-AM', {dateStyle: 'short', timeStyle: 'short'});

    if (phone && name && address && people > 0) {
        const order = {
            items: [...currentOrder],
            phone: phone,
            name: name,
            address: address,
            people: people,
            description: description,
            deliveryFee: deliveryFee,
            orderDate: orderDate
        };

        if (editingOrderIndex !== null) {
            confirmedOrders.splice(editingOrderIndex, 0, order);
            editingOrderIndex = confirmedOrders.length - 1;
            editingOrderData = {phone, name, address, people, description, deliveryFee};
        } else {
            confirmedOrders.push(order);
            editingOrderIndex = confirmedOrders.length - 1;
            editingOrderData = {phone, name, address, people, description, deliveryFee};
        }

        localStorage.setItem('confirmedSushiOrders', JSON.stringify(confirmedOrders));
        currentOrder = [];
        displayCurrentOrder();
        displayConfirmedOrders();
        closeModal();
    } else {
        alert('Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը:');
    }
}

// Ուղարկել պատվերը առաքման
function sendOrder(index) {
    const order = confirmedOrders.splice(index, 1)[0];
    deliveryOrders.push(order);
    localStorage.setItem('confirmedSushiOrders', JSON.stringify(confirmedOrders));
    localStorage.setItem('deliverySushiOrders', JSON.stringify(deliveryOrders));
    displayConfirmedOrders();
    displayDeliveryOrders();
}

// Տպել պատվերը
function printOrder(index, type) {
    const order = type === 'confirmed' ? confirmedOrders[index] : archivedOrders[index];
    let printContent = `<h2>Պատվեր #${index + 1}</h2>`;
    printContent += `<p><strong>Ամսաթիվ:</strong> ${order.orderDate}</p>`;
    printContent += `<p><strong>Անուն:</strong> ${order.name}</p>`;
    printContent += `<p><strong>Հեռախոսահամար:</strong> ${order.phone}</p>`;
    printContent += `<p><strong>Հասցե:</strong> ${order.address}</p>`;
    printContent += `<p><strong>Մարդկանց քանակ:</strong> ${order.people}</p>`;
    printContent += `<p><strong>Նկարագրություն:</strong> ${order.description || 'Չկա'}</p>`;
    order.items.forEach(item => {
        printContent += `<p>${item.type} - ${item.quantity} հատ (Ընդհանուր: ${item.quantity * prices[item.type]} դրամ)</p>`;
    });
    printContent += `<p><strong>Ընդհանուր: ${calculateTotal(order.items, order.deliveryFee || 0)} դրամ ${order.deliveryFee ? `(Առաքման վճար: ${order.deliveryFee} դրամ)` : ''}</strong></p>`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head><title>Պատվեր #${index + 1}</title></head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Հաստատել առաքումը և տեղափոխել արխիվ
function confirmDelivery(index) {
    const order = deliveryOrders.splice(index, 1)[0];
    archivedOrders.push(order);
    localStorage.setItem('deliverySushiOrders', JSON.stringify(deliveryOrders));
    localStorage.setItem('archivedSushiOrders', JSON.stringify(archivedOrders));
    displayDeliveryOrders();
    displayArchivedOrders();
}

// Նավիգացիոն մենյուի ֆունկցիոնալություն
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-menu button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.nav-menu button[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// Կառավարել առաքման վճարի դաշտի ցուցադրումը
document.getElementById('delivery-checkbox').addEventListener('change', function () {
    document.getElementById('delivery-fee').style.display = this.checked ? 'block' : 'none';
});

// Ի սկզբանե ցուցադրել պատվերները
displayCurrentOrder();
displayConfirmedOrders();
displayDeliveryOrders();
displayArchivedOrders();
