// Application State
let currentUser = null;
let currentView = 'home';
let previousView = 'home';
let currentUserType = 'rider'; // rider, driver, admin
let walletBalance = 247.50;
let selectedCity = '';
let isDriverOnline = false;
let hasActiveDelivery = false;

// ======= MAP & REAL-TIME TRACKING DATA =======
const mexicoCityPOI = [
  { name: "Museo Frida Kahlo", lat: 19.3553, lng: -99.1624, category: "museum", description: "UNESCO World Heritage Site" },
  { name: "Zócalo", lat: 19.4326, lng: -99.1332, category: "historic", description: "Main square and historic center" },
  { name: "Chapultepec Castle", lat: 19.4204, lng: -99.1820, category: "historic", description: "Hilltop castle with city views" },
  { name: "Palacio de Bellas Artes", lat: 19.4353, lng: -99.1412, category: "cultural", description: "Art Nouveau architecture" },
  { name: "Museo Nacional de Antropología", lat: 19.4260, lng: -99.1860, category: "museum", description: "World-class anthropology museum" },
  { name: "Chapultepec Park", lat: 19.4194, lng: -99.1892, category: "park", description: "Largest park in Latin America" }
];
const commonAddresses = [
  "Av. Paseo de la Reforma 222, Juárez, CDMX",
  "Av. Insurgentes Sur 421, Hipódromo, CDMX",
  "Calle Londres 247, Juárez, CDMX",
  "Avenida Universidad 3000, Coyoacán, CDMX",
  "Eje Central Lázaro Cárdenas 13, Centro, CDMX",
];
const simulatedDrivers = [
  { id: "driver_1", name: "Carlos M.", rating: 4.8, vehicle: "Toyota Corolla", color: "White", plate: "ABC-1234", lat: 19.4300, lng: -99.1300, heading: 45,
    photo: "https://r2cdn.perplexity.ai/files/avatar_carlos.webp" },
  { id: "driver_2", name: "María G.", rating: 4.9, vehicle: "Nissan Sentra", color: "Gray", plate: "XYZ-5678", lat: 19.4350, lng: -99.1400, heading: 180,
    photo: "https://r2cdn.perplexity.ai/files/avatar_maria.webp" },
  { id: "driver_3", name: "Juan P.", rating: 4.7, vehicle: "Honda Civic", color: "Blue", plate: "DEF-9012", lat: 19.4280, lng: -99.1350, heading: 270,
    photo: "https://r2cdn.perplexity.ai/files/avatar_juan.webp" }
];
const routeTypes = [
  { type: "fastest", name: "Fastest Route", color: "#3B82F6", icon: "⚡", benefits: "Saves time, avoids traffic" },
  { type: "scenic", name: "Scenic Route", color: "#10B981", icon: "📸", benefits: "Pass by museums, parks, monuments" },
  { type: "economical", name: "Economical Route", color: "#F59E0B", icon: "💰", benefits: "Avoids tolls, saves money" }
];
const trackingStates = [
  { state: "searching", message: "Finding nearby drivers..." },
  { state: "driver_assigned", message: "Driver on the way" },
  { state: "driver_arriving", message: "Driver arriving in {time}" },
  { state: "driver_arrived", message: "Driver has arrived" },
  { state: "in_progress", message: "En route to destination" },
  { state: "completed", message: "You've arrived" },
];
let locationPermissionStatus = null; // 'granted', 'denied', null
let userLocation = null;
let pickupLocation = null;
let dropoffLocation = null;
let selectedRoute = null;
let activeDriver = null;
let bookingState = null; // searching, assigned, arriving, arrived, in_progress, completed
let map, userMarker, pickupMarker, dropoffMarker, driverMarkers = [], poiMarkers = [], routeLines = [];
let driverAnimInterval = null;
let rideStartTime = null;

// ======= END MAP & TRACKING DATA =======

// Application Data
const cities = [
  { name: 'Ciudad de Mexico', active: true },
  { name: 'Guadalajara', active: true },
  { name: 'Monterrey', active: true },
  { name: 'Puebla', active: true },
  { name: 'Tijuana', active: true },
  { name: 'León', active: true },
  { name: 'Juárez', active: true },
  { name: 'Torreón', active: true },
  { name: 'Querétaro', active: true },
  { name: 'Mérida', active: true }
];

const services = [
  {
    id: 'taxi',
    name: 'TAXI',
    icon: 'car',
    color: 'taxi',
    price: '$45-65 MXN',
    eta: '5-8 min',
    description: 'Taxi tradicional con conductor profesional'
  },
  {
    id: 'moto',
    name: 'MOTO TAXI',
    icon: 'motorcycle',
    color: 'moto',
    price: '$25-35 MXN',
    eta: '3-5 min',
    description: 'Rápido y económico para distancias cortas'
  },
  {
    id: 'colectivo',
    name: 'COLECTIVO',
    icon: 'users',
    color: 'colectivo',
    price: '$15-25 MXN',
    eta: 'Variable',
    description: 'Transporte compartido económico'
  },
  {
    id: 'pickup',
    name: 'PICKUP',
    icon: 'truck',
    color: 'pickup',
    price: '$80-120 MXN',
    eta: '10-15 min',
    description: 'Para mudanzas y carga pesada'
  },
  {
    id: 'errands',
    name: 'ERRANDS & TASKS',
    icon: 'shopping-bag',
    color: 'errands',
    price: '$45+ MXN',
    eta: 'Variable',
    description: 'Multi-stop errands: flowers, groceries, dry cleaning, and more',
    isNew: true
  }
];

const featureToggles = {
  'Taxi Service': true,
  'Moto Taxi Service': true,
  'Colectivo Service': true,
  'Pickup/Delivery Service': true,
  'Food Delivery': true,
  'Errands & Tasks Service': true,
  'Meeting/Dating Module': false,
  'Women-Only Rides': true,
  'Subscription Plans': true,
  'Crypto Payments': true,
  'AI Route Optimization': true,
  'Loyalty Rewards Program': true
};

const transactions = [
  { type: 'Ride Payment', date: '2025-10-17', amount: -45.50, positive: false },
  { type: 'Wallet Top-up', date: '2025-10-16', amount: 200.00, positive: true },
  { type: 'Food Delivery', date: '2025-10-16', amount: -32.75, positive: false },
  { type: 'Refund', date: '2025-10-15', amount: 25.25, positive: true },
  { type: 'Ride Payment', date: '2025-10-15', amount: -38.00, positive: false }
];

// ============= ERRANDS & TASKS FUNCTIONALITY =============

// Errands application state
let currentErrands = {
  stops: [],
  optimizedRoute: false,
  totalDistance: 0,
  totalWaitTime: 0,
  shoppingAmount: 0
};

const errandsPricing = {
  baseFee: 45.00,
  additionalStopFee: 15.00,
  perKmRate: 13.00,
  waitTimePer5Min: 5.00,
  shoppingFeePercent: 10,
  serviceFeePercent: 5,
  maxStops: 5
};

const taskTypes = [
  { value: 'pickup', label: 'Pick up item', surcharge: 0 },
  { value: 'dropoff', label: 'Drop off item', surcharge: 0 },
  { value: 'shop', label: 'Shop for me (with shopping list)', surcharge: 20 },
  { value: 'wait', label: 'Wait in line', surcharge: 10 },
  { value: 'bill', label: 'Pay bill in person', surcharge: 15 },
  { value: 'custom', label: 'Custom task', surcharge: 5 }
];

// Errands Service Functions
function showErrandsView() {
  showView('errands');
  resetErrandsState();
  updatePricingCalculator();
}

function resetErrandsState() {
  currentErrands = {
    stops: [],
    optimizedRoute: false,
    totalDistance: 0,
    totalWaitTime: 0,
    shoppingAmount: 0
  };
  document.getElementById('stopsContainer').innerHTML = '';
  updateAddStopButton();
  updateRequestButton();
}

function addStop() {
  if (currentErrands.stops.length >= errandsPricing.maxStops) {
    showNotification(`Maximum ${errandsPricing.maxStops} stops allowed`, 'warning');
    return;
  }

  const stopNumber = currentErrands.stops.length + 1;
  const stopId = `stop_${stopNumber}`;
  
  const stop = {
    id: stopId,
    number: stopNumber,
    location: '',
    taskType: '',
    description: '',
    waitTime: 5,
    paymentMethod: 'customer_card',
    estimatedAmount: 0,
    specialInstructions: ''
  };

  currentErrands.stops.push(stop);
  renderStop(stop);
  updateAddStopButton();
  updateRequestButton();
  updatePricingCalculator();
}

function renderStop(stop) {
  const container = document.getElementById('stopsContainer');
  const stopCard = document.createElement('div');
  stopCard.className = 'stop-card';
  stopCard.id = `stopCard_${stop.id}`;
  
  stopCard.innerHTML = `
    <div class="stop-header">
      <div class="stop-number">Stop ${stop.number}</div>
      <button class="stop-delete" onclick="removeStop('${stop.id}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="stop-content">
      <div class="stop-field">
        <label>Location</label>
        <input type="text" placeholder="Enter address or landmark" 
               onchange="updateStopField('${stop.id}', 'location', this.value)">
        <button type="button" class="btn btn--sm btn--outline" style="margin-top: 4px;" 
                onclick="useCurrentLocation('${stop.id}')">
          <i class="fas fa-map-marker-alt"></i> Use current location
        </button>
      </div>
      
      <div class="stop-field">
        <label>Task Type</label>
        <select onchange="updateStopField('${stop.id}', 'taskType', this.value)">
          <option value="">Select task type</option>
          ${taskTypes.map(task => `<option value="${task.value}">${task.label}</option>`).join('')}
        </select>
      </div>
      
      <div class="stop-field">
        <label>Task Description</label>
        <textarea placeholder="e.g., Pick up 12 red roses, ask for fresh ones" maxlength="200"
                  onchange="updateStopField('${stop.id}', 'description', this.value)"></textarea>
      </div>
      
      <div class="stop-field">
        <label>Estimated Time at Location</label>
        <select onchange="updateStopField('${stop.id}', 'waitTime', this.value)">
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </div>
      
      <div class="stop-field" id="paymentField_${stop.id}" style="display:none;">
        <label>Payment for Items</label>
        <select onchange="updateStopField('${stop.id}', 'paymentMethod', this.value)">
          <option value="customer_cash">I'll provide cash to driver</option>
          <option value="customer_card">Charge my card</option>
          <option value="prepaid">Already paid online</option>
        </select>
      </div>
      
      <div class="stop-field" id="amountField_${stop.id}" style="display:none;">
        <label>Estimated Amount (MXN)</label>
        <input type="number" min="0" step="0.01" placeholder="0.00"
               onchange="updateStopField('${stop.id}', 'estimatedAmount', this.value)">
      </div>
      
      <div class="stop-field">
        <label>Special Instructions (Optional)</label>
        <input type="text" placeholder="Call me when you arrive, ring doorbell, etc."
               onchange="updateStopField('${stop.id}', 'specialInstructions', this.value)">
      </div>
      
      <div class="stop-field">
        <label>Reference Photo (Optional)</label>
        <input type="file" accept="image/*" onchange="uploadReferencePhoto('${stop.id}', this)">
        <small style="color: var(--color-text-secondary); margin-top: 4px;">Upload a photo showing the exact item you want</small>
      </div>
    </div>
  `;
  
  container.appendChild(stopCard);
}

function removeStop(stopId) {
  const index = currentErrands.stops.findIndex(stop => stop.id === stopId);
  if (index === -1) return;
  
  currentErrands.stops.splice(index, 1);
  document.getElementById(`stopCard_${stopId}`).remove();
  
  // Renumber remaining stops
  currentErrands.stops.forEach((stop, i) => {
    stop.number = i + 1;
    const card = document.getElementById(`stopCard_${stop.id}`);
    if (card) {
      card.querySelector('.stop-number').textContent = `Stop ${stop.number}`;
    }
  });
  
  updateAddStopButton();
  updateRequestButton();
  updatePricingCalculator();
}

function updateStopField(stopId, field, value) {
  const stop = currentErrands.stops.find(s => s.id === stopId);
  if (!stop) return;
  
  stop[field] = value;
  
  // Show/hide payment fields for shopping tasks
  if (field === 'taskType') {
    const paymentField = document.getElementById(`paymentField_${stopId}`);
    const amountField = document.getElementById(`amountField_${stopId}`);
    
    if (value === 'shop') {
      paymentField.style.display = 'block';
      amountField.style.display = 'block';
    } else {
      paymentField.style.display = 'none';
      amountField.style.display = 'none';
    }
  }
  
  updateRequestButton();
  updatePricingCalculator();
}

function useCurrentLocation(stopId) {
  if (userLocation) {
    updateStopField(stopId, 'location', userLocation.address || 'Current Location');
    const input = document.querySelector(`#stopCard_${stopId} input[type="text"]`);
    if (input) input.value = userLocation.address || 'Current Location';
    showNotification('Current location added to stop', 'success');
  } else {
    showNotification('Current location not available', 'warning');
  }
}

function uploadReferencePhoto(stopId, input) {
  if (input.files && input.files[0]) {
    showNotification('Reference photo uploaded successfully', 'success');
  }
}

function updateAddStopButton() {
  const button = document.querySelector('.add-stop-btn');
  if (currentErrands.stops.length >= errandsPricing.maxStops) {
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-plus"></i> Maximum ${errandsPricing.maxStops} stops reached`;
  } else {
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-plus"></i> Add Stop (Maximum ${errandsPricing.maxStops})`;
  }
}

function updateRequestButton() {
  const button = document.getElementById('requestErrandsBtn');
  const validStops = currentErrands.stops.filter(stop => 
    stop.location.trim() && stop.taskType && stop.description.trim()
  );
  
  if (validStops.length === 0) {
    button.disabled = true;
    button.textContent = 'Request Errands - Add stops first';
  } else if (validStops.length !== currentErrands.stops.length) {
    button.disabled = true;
    button.textContent = 'Request Errands - Complete all stop details';
  } else {
    button.disabled = false;
    const total = calculateTotalPrice();
    button.textContent = `Request Errands - $${total.toFixed(2)} MXN`;
  }
}

function optimizeRoute() {
  if (currentErrands.stops.length < 2) {
    showNotification('Add at least 2 stops to optimize route', 'info');
    return;
  }
  
  showNotification('AI optimizing your route for efficiency...', 'info');
  
  setTimeout(() => {
    currentErrands.optimizedRoute = true;
    // Simulate route optimization by shuffling stops (in real app, use TSP algorithm)
    const shuffled = [...currentErrands.stops];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Renumber and re-render
    shuffled.forEach((stop, i) => {
      stop.number = i + 1;
    });
    currentErrands.stops = shuffled;
    
    // Re-render all stops
    const container = document.getElementById('stopsContainer');
    container.innerHTML = '';
    currentErrands.stops.forEach(renderStop);
    
    showNotification('Route optimized! Saved approximately 8 minutes', 'success');
    updatePricingCalculator();
  }, 1500);
}

function viewFullMap() {
  showNotification('Opening full map view with route preview...', 'info');
}

function calculateTotalPrice() {
  let baseFee = errandsPricing.baseFee;
  let additionalStops = Math.max(0, currentErrands.stops.length - 1);
  let additionalStopsFee = additionalStops * errandsPricing.additionalStopFee;
  
  // Simulate distance calculation (in real app, use mapping API)
  let estimatedDistance = currentErrands.stops.length > 0 ? 
    2.5 + (currentErrands.stops.length - 1) * 3.2 : 0; // Base + stops
  let distanceFee = estimatedDistance * errandsPricing.perKmRate;
  
  // Calculate wait time
  let totalWaitTime = currentErrands.stops.reduce((sum, stop) => sum + parseInt(stop.waitTime || 0), 0);
  let waitTimeFee = Math.ceil(totalWaitTime / 5) * errandsPricing.waitTimePer5Min;
  
  // Calculate shopping fee
  let shoppingAmount = currentErrands.stops
    .filter(stop => stop.taskType === 'shop')
    .reduce((sum, stop) => sum + parseFloat(stop.estimatedAmount || 0), 0);
  let shoppingFee = shoppingAmount * (errandsPricing.shoppingFeePercent / 100);
  
  let subtotal = baseFee + additionalStopsFee + distanceFee + waitTimeFee + shoppingFee;
  let serviceFee = subtotal * (errandsPricing.serviceFeePercent / 100);
  let total = subtotal + serviceFee;
  
  return total;
}

function updatePricingCalculator() {
  const baseFeeEl = document.getElementById('baseFeeAmount');
  const additionalStopsLine = document.getElementById('additionalStopsLine');
  const additionalStopsCount = document.getElementById('additionalStopsCount');
  const additionalStopsAmount = document.getElementById('additionalStopsAmount');
  const distanceLine = document.getElementById('distanceLine');
  const totalDistance = document.getElementById('totalDistance');
  const perKmRate = document.getElementById('perKmRate');
  const distanceAmount = document.getElementById('distanceAmount');
  const waitTimeLine = document.getElementById('waitTimeLine');
  const totalWaitTime = document.getElementById('totalWaitTime');
  const waitTimeAmount = document.getElementById('waitTimeAmount');
  const shoppingFeeLine = document.getElementById('shoppingFeeLine');
  const shoppingAmount = document.getElementById('shoppingAmount');
  const shoppingFeeAmount = document.getElementById('shoppingFeeAmount');
  const subtotalAmount = document.getElementById('subtotalAmount');
  const serviceFeeAmount = document.getElementById('serviceFeeAmount');
  const totalAmount = document.getElementById('totalAmount');
  
  if (!baseFeeEl) return;
  
  let baseFee = errandsPricing.baseFee;
  let additionalStops = Math.max(0, currentErrands.stops.length - 1);
  let additionalStopsFee = additionalStops * errandsPricing.additionalStopFee;
  
  let estimatedDistance = currentErrands.stops.length > 0 ? 
    2.5 + (currentErrands.stops.length - 1) * 3.2 : 0;
  let distanceFee = estimatedDistance * errandsPricing.perKmRate;
  
  let waitTime = currentErrands.stops.reduce((sum, stop) => sum + parseInt(stop.waitTime || 0), 0);
  let waitTimeFee = Math.ceil(waitTime / 5) * errandsPricing.waitTimePer5Min;
  
  let shoppingAmt = currentErrands.stops
    .filter(stop => stop.taskType === 'shop')
    .reduce((sum, stop) => sum + parseFloat(stop.estimatedAmount || 0), 0);
  let shoppingFee = shoppingAmt * (errandsPricing.shoppingFeePercent / 100);
  
  let subtotal = baseFee + additionalStopsFee + distanceFee + waitTimeFee + shoppingFee;
  let serviceFee = subtotal * (errandsPricing.serviceFeePercent / 100);
  let total = subtotal + serviceFee;
  
  baseFeeEl.textContent = `$${baseFee.toFixed(2)} MXN`;
  
  if (additionalStops > 0) {
    additionalStopsLine.style.display = 'block';
    additionalStopsCount.textContent = additionalStops;
    additionalStopsAmount.textContent = `$${additionalStopsFee.toFixed(2)} MXN`;
  } else {
    additionalStopsLine.style.display = 'none';
  }
  
  if (estimatedDistance > 0) {
    distanceLine.style.display = 'block';
    totalDistance.textContent = estimatedDistance.toFixed(1);
    perKmRate.textContent = `$${errandsPricing.perKmRate}`;
    distanceAmount.textContent = `$${distanceFee.toFixed(2)} MXN`;
  } else {
    distanceLine.style.display = 'none';
  }
  
  if (waitTime > 0) {
    waitTimeLine.style.display = 'block';
    totalWaitTime.textContent = waitTime;
    waitTimeAmount.textContent = `$${waitTimeFee.toFixed(2)} MXN`;
  } else {
    waitTimeLine.style.display = 'none';
  }
  
  if (shoppingAmt > 0) {
    shoppingFeeLine.style.display = 'block';
    shoppingAmount.textContent = shoppingAmt.toFixed(0);
    shoppingFeeAmount.textContent = `$${shoppingFee.toFixed(2)} MXN`;
  } else {
    shoppingFeeLine.style.display = 'none';
  }
  
  subtotalAmount.textContent = `$${subtotal.toFixed(2)} MXN`;
  serviceFeeAmount.textContent = `$${serviceFee.toFixed(2)} MXN`;
  totalAmount.textContent = `$${total.toFixed(2)} MXN`;
}

function requestErrands() {
  if (currentErrands.stops.length === 0) {
    showNotification('Please add at least one stop', 'warning');
    return;
  }
  
  const total = calculateTotalPrice();
  showNotification(`Processing errands request for $${total.toFixed(2)} MXN...`, 'info');
  
  setTimeout(() => {
    showNotification('Errands request submitted! Finding available helper...', 'success');
    // In real app, this would transition to driver tracking
  }, 2000);
}

// Admin Errands Management Functions
function showAdminErrandsView() {
  showView('adminErrands');
  populateErrandsAdmin();
}

function populateErrandsAdmin() {
  // Populate with sample data
  const tableBody = document.getElementById('errandsTableBody');
  if (tableBody) {
    // Sample data is already in HTML for demo
  }
}

function switchAdminTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.admin-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all tab buttons
  document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

function loadCityPricing() {
  const city = document.getElementById('cityPricingSelect').value;
  showNotification(`Loading pricing for ${city}...`, 'info');
}

function copyCityPricing() {
  showNotification('Pricing copied from global settings', 'success');
}

function calculateTestPrice() {
  const stops = parseInt(document.getElementById('calcStops').value) || 0;
  const distance = parseFloat(document.getElementById('calcDistance').value) || 0;
  const waitTime = parseInt(document.getElementById('calcWaitTime').value) || 0;
  const shoppingAmount = parseFloat(document.getElementById('calcShoppingAmount').value) || 0;
  
  let baseFee = errandsPricing.baseFee;
  let additionalStopsFee = Math.max(0, stops - 1) * errandsPricing.additionalStopFee;
  let distanceFee = distance * errandsPricing.perKmRate;
  let waitTimeFee = Math.ceil(waitTime / 5) * errandsPricing.waitTimePer5Min;
  let shoppingFee = shoppingAmount * (errandsPricing.shoppingFeePercent / 100);
  
  let subtotal = baseFee + additionalStopsFee + distanceFee + waitTimeFee + shoppingFee;
  let serviceFee = subtotal * (errandsPricing.serviceFeePercent / 100);
  let total = subtotal + serviceFee;
  
  document.getElementById('calculatorResult').textContent = `Total: $${total.toFixed(2)} MXN`;
}

function savePricingSettings() {
  // Update pricing from form values
  errandsPricing.baseFee = parseFloat(document.getElementById('baseFee').value) || 45.00;
  errandsPricing.additionalStopFee = parseFloat(document.getElementById('additionalStopFee').value) || 15.00;
  errandsPricing.perKmRate = parseFloat(document.getElementById('perKmRate').value) || 13.00;
  errandsPricing.waitTimePer5Min = parseFloat(document.getElementById('waitTimeFee').value) || 5.00;
  errandsPricing.shoppingFeePercent = parseFloat(document.getElementById('shoppingFeePercent').value) || 10;
  errandsPricing.maxStops = parseInt(document.getElementById('maxStops').value) || 5;
  
  showNotification('Pricing settings saved successfully! Changes apply to new errands immediately.', 'success');
  
  // Update any active pricing calculator
  if (currentView === 'errands') {
    updatePricingCalculator();
  }
}

// Export errands functions
window.showErrandsView = showErrandsView;
window.addStop = addStop;
window.removeStop = removeStop;
window.updateStopField = updateStopField;
window.useCurrentLocation = useCurrentLocation;
window.uploadReferencePhoto = uploadReferencePhoto;
window.optimizeRoute = optimizeRoute;
window.viewFullMap = viewFullMap;
window.requestErrands = requestErrands;
window.showAdminErrandsView = showAdminErrandsView;
window.switchAdminTab = switchAdminTab;
window.loadCityPricing = loadCityPricing;
window.copyCityPricing = copyCityPricing;
window.calculateTestPrice = calculateTestPrice;
window.savePricingSettings = savePricingSettings;

// ============= END ERRANDS FUNCTIONALITY =============

// ============= ADVANCED AI INTEGRATION LAYER =============

// AI Service Configuration
const aiServices = {
  perplexityPro: {
    enabled: true,
    apiKey: process.env.PERPLEXITY_API_KEY || 'pplx-demo-key',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    model: 'sonar-large-32k-chat'
  },
  gpt5: {
    enabled: true,
    apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4'
  },
  claude: {
    enabled: true,
    apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-demo-key',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022'
  },
  hetstan: {
    enabled: true,
    apiKey: process.env.HETSTAN_API_KEY || 'hs-demo-key',
    endpoint: 'https://api.hetstan.ai/v1/nlp',
    model: 'hetstan-nlp-v3'
  }
};

// AI Reasoning Levels
const aiReasoningLevels = {
  1: { name: 'Basic Logic', description: 'Simple if-then logic and basic validation' },
  2: { name: 'Pattern Recognition', description: 'Identify patterns in data and user behavior' },
  3: { name: 'Predictive Analysis', description: 'Forecast trends and predict outcomes' },
  4: { name: 'Complex Planning', description: 'Multi-step planning and optimization' },
  5: { name: 'Multi-Step Validation', description: 'Comprehensive validation across systems' },
  6: { name: 'Strategic Reasoning', description: 'Long-term strategic analysis and planning' },
  7: { name: 'Adaptive Learning', description: 'Learning from patterns and adapting behavior' },
  8: { name: 'Meta-Cognitive Analysis', description: 'Reasoning about reasoning processes' }
};

// AI Chat State
let aiChatHistory = [];
let currentAISession = null;

// AI Assistant Functions
function sendAIMessage() {
  const input = document.getElementById('aiChatInput');
  if (!input || !input.value.trim()) return;
  
  const message = input.value.trim();
  input.value = '';
  
  // Add user message to chat
  addAIMessage(message, 'user');
  
  // Show typing indicator
  showAITyping();
  
  // Process AI response
  processAIQuery(message);
}

function handleAIChatKeypress(event) {
  if (event.key === 'Enter') {
    sendAIMessage();
  }
}

function addAIMessage(message, sender = 'ai') {
  const messagesContainer = document.getElementById('aiChatMessages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'ai-message user-message' : 'ai-message';
  
  messageDiv.innerHTML = `
    <div class="ai-avatar">
      <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
    </div>
    <div class="message-content">
      <p>${message}</p>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Store in history
  aiChatHistory.push({ message, sender, timestamp: Date.now() });
}

function showAITyping() {
  const messagesContainer = document.getElementById('aiChatMessages');
  if (!messagesContainer) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'aiTypingIndicator';
  typingDiv.className = 'ai-message';
  typingDiv.innerHTML = `
    <div class="ai-avatar">
      <i class="fas fa-robot"></i>
    </div>
    <div class="message-content">
      <p><i class="fas fa-spinner fa-spin"></i> AI is thinking...</p>
    </div>
  `;
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeAITyping() {
  const typingIndicator = document.getElementById('aiTypingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

async function processAIQuery(query) {
  try {
    // Determine reasoning level needed
    const reasoningLevel = determineReasoningLevel(query);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    removeAITyping();
    
    // Generate AI response based on query type
    let response = await generateAIResponse(query, reasoningLevel);
    
    addAIMessage(response);
    
    // Log AI action
    logAIAction('chat_response', query, reasoningLevel);
    
  } catch (error) {
    removeAITyping();
    addAIMessage('I apologize, but I encountered an error processing your request. Please try again.');
    console.error('AI Query Error:', error);
  }
}

function determineReasoningLevel(query) {
  const lowercaseQuery = query.toLowerCase();
  
  if (lowercaseQuery.includes('predict') || lowercaseQuery.includes('forecast')) return 3;
  if (lowercaseQuery.includes('optimize') || lowercaseQuery.includes('plan')) return 4;
  if (lowercaseQuery.includes('validate') || lowercaseQuery.includes('test')) return 5;
  if (lowercaseQuery.includes('strategy') || lowercaseQuery.includes('long-term')) return 6;
  if (lowercaseQuery.includes('learn') || lowercaseQuery.includes('adapt')) return 7;
  if (lowercaseQuery.includes('analyze') || lowercaseQuery.includes('meta')) return 8;
  if (lowercaseQuery.includes('pattern') || lowercaseQuery.includes('recognize')) return 2;
  
  return 1; // Default to basic logic
}

async function generateAIResponse(query, reasoningLevel) {
  const responses = {
    platform_analysis: `Based on Level ${reasoningLevel} analysis, your platform is performing well. I see ${Math.floor(Math.random() * 1000 + 5000)} active users, ${Math.floor(Math.random() * 50 + 150)} concurrent rides, and a 98.7% uptime rate. Would you like me to dive deeper into any specific metrics?`,
    
    optimization: `Using Level ${reasoningLevel} reasoning, I recommend optimizing driver routes in the Polanco area where wait times are 23% above average. Implementing dynamic pricing could improve driver availability by an estimated 15%.`,
    
    prediction: `My Level ${reasoningLevel} predictive models indicate a 34% increase in ride demand this weekend, particularly in the Roma Norte and Condesa areas between 8-10 PM. I suggest pre-positioning 8-12 additional drivers in these zones.`,
    
    health_check: `System health check complete using Level ${reasoningLevel} validation:\n\n✅ Database response: 0.2ms avg\n✅ Payment gateway: 99.8% success\n✅ Driver API: Operational\n⚠️ SMS gateway: 2.1s delay detected\n\nRecommendation: Consider switching to backup SMS provider.`,
    
    decision_support: `Based on Level ${reasoningLevel} strategic analysis, I recommend implementing the helicopter service pilot program. Market research shows 23% interest among premium users, with projected revenue of $47K monthly. Risk assessment: Low to moderate.`
  };
  
  // Simple keyword matching for demo
  if (query.toLowerCase().includes('health') || query.toLowerCase().includes('status')) {
    return responses.health_check;
  }
  
  if (query.toLowerCase().includes('predict') || query.toLowerCase().includes('demand')) {
    return responses.prediction;
  }
  
  if (query.toLowerCase().includes('optimize') || query.toLowerCase().includes('improve')) {
    return responses.optimization;
  }
  
  if (query.toLowerCase().includes('decision') || query.toLowerCase().includes('recommend')) {
    return responses.decision_support;
  }
  
  if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('metrics')) {
    return responses.platform_analysis;
  }
  
  // Default response
  return `I understand you're asking about "${query}". I'm using Level ${reasoningLevel} reasoning to analyze this. Could you provide more specific details about what aspect you'd like me to focus on? I can help with platform analysis, optimization, predictions, health checks, or decision support.`;
}

// ============= TOKENIZATION MODULE =============

const tokenizationSystem = {
  tokens: {
    RIDE: {
      symbol: 'RIDE',
      name: 'AIRide Token',
      totalSupply: 10000000,
      circulatingSupply: 2500000,
      currentPrice: 0.45,
      network: ['ethereum', 'solana', 'polygon'],
      contractAddresses: {
        ethereum: '0x1234...abcd',
        solana: 'RIDE1234...abcd',
        polygon: '0x5678...efgh'
      }
    }
  },
  
  rewards: {
    rideCompletion: 5,
    driverIncentive: 3,
    referralBonus: 25,
    weeklyActiveBonus: 10,
    perfectRating: 2
  },
  
  governance: {
    activeProposals: [
      {
        id: 'PROP-001',
        title: 'Increase Driver Commission Rate',
        description: 'Proposal to increase driver commission from 80% to 85%',
        votesFor: 65432,
        votesAgainst: 34123,
        status: 'active',
        endDate: '2025-10-25'
      }
    ]
  },
  
  smartContracts: {
    rewardDistribution: {
      address: '0xabcd...1234',
      status: 'active',
      version: '1.2.0'
    },
    governance: {
      address: '0xefgh...5678',
      status: 'active',
      version: '1.0.0'
    }
  }
};

function switchTokenTab(tabName) {
  // Hide all token tab contents
  document.querySelectorAll('.token-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all token tab buttons
  document.querySelectorAll('.token-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const targetTab = document.getElementById(tabName + 'TokenTab');
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Set active button
  event.target.classList.add('active');
}

function distributeTokens(userId, amount, reason) {
  // Simulate token distribution
  showNotification(`${amount} RIDE tokens distributed to user ${userId} for ${reason}`, 'success');
  
  // Log token transaction
  logTokenTransaction(userId, amount, reason);
}

function logTokenTransaction(userId, amount, reason) {
  console.log(`Token Transaction: ${amount} RIDE to ${userId} - ${reason}`);
  // In production, this would log to blockchain
}

// ============= AUTOMATED TASK MANAGEMENT =============

const taskAutomationEngine = {
  queue: [],
  rules: [
    {
      id: 'driver_assignment',
      name: 'Driver Auto-Assignment',
      trigger: 'ride_request',
      condition: 'no_driver_assigned_5min',
      action: 'assign_nearest_driver',
      enabled: true,
      priority: 'high'
    },
    {
      id: 'task_escalation',
      name: 'Task Escalation',
      trigger: 'task_timeout',
      condition: 'no_action_30min',
      action: 'escalate_to_admin',
      enabled: true,
      priority: 'medium'
    },
    {
      id: 'anomaly_detection',
      name: 'Anomaly Detection',
      trigger: 'pattern_detected',
      condition: 'unusual_activity',
      action: 'send_alert',
      enabled: true,
      priority: 'high'
    }
  ],
  
  selfHealingRules: [
    {
      id: 'db_recovery',
      name: 'Database Connection Recovery',
      trigger: 'db_connection_lost',
      action: 'restart_connection_pool',
      lastTriggered: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
    },
    {
      id: 'payment_failover',
      name: 'Payment Gateway Failover',
      trigger: 'payment_gateway_down',
      action: 'switch_to_backup_gateway',
      lastTriggered: null
    },
    {
      id: 'auto_scale',
      name: 'Load Balancer Auto-Scale',
      trigger: 'high_cpu_usage',
      action: 'scale_up_instances',
      lastTriggered: Date.now() - 4 * 60 * 60 * 1000 // 4 hours ago
    }
  ]
};

function processAutomatedTasks() {
  // Simulate automated task processing
  taskAutomationEngine.queue.forEach(task => {
    processTaskWithAI(task);
  });
}

function processTaskWithAI(task) {
  const reasoningLevel = determineTaskComplexity(task);
  
  console.log(`Processing task ${task.id} with Level ${reasoningLevel} AI reasoning`);
  
  // Simulate AI processing
  setTimeout(() => {
    completeAutomatedTask(task, reasoningLevel);
  }, Math.random() * 2000 + 1000);
}

function determineTaskComplexity(task) {
  if (task.type === 'driver_assignment') return 2;
  if (task.type === 'route_optimization') return 4;
  if (task.type === 'fraud_detection') return 6;
  if (task.type === 'predictive_scaling') return 7;
  return 1;
}

function completeAutomatedTask(task, reasoningLevel) {
  logAIAction(`automated_${task.type}`, task.description, reasoningLevel);
  showNotification(`Automated task completed: ${task.name}`, 'success');
}

function createAutomation() {
  showNotification('Opening automation builder...', 'info');
  // In production, would open automation creation wizard
}

function runDiagnostics() {
  showNotification('Running system diagnostics...', 'info');
  
  setTimeout(() => {
    showNotification('Diagnostics complete. All systems operational.', 'success');
    updateHealthMetrics();
  }, 3000);
}

// ============= CONTINUOUS MONITORING =============

const monitoringSystem = {
  healthScore: 98.7,
  securityScore: 99.2,
  responseTime: 0.2,
  validationTests: [
    { level: 1, name: 'Basic Logic Validation', status: 'passed', lastRun: Date.now() },
    { level: 2, name: 'Pattern Recognition', status: 'passed', lastRun: Date.now() },
    { level: 3, name: 'Predictive Analysis', status: 'passed', lastRun: Date.now() },
    { level: 4, name: 'Complex Planning', status: 'passed', lastRun: Date.now() },
    { level: 5, name: 'Multi-Step Validation', status: 'passed', lastRun: Date.now() },
    { level: 6, name: 'Strategic Reasoning', status: 'passed', lastRun: Date.now() },
    { level: 7, name: 'Adaptive Learning', status: 'warning', lastRun: Date.now() },
    { level: 8, name: 'Meta-Cognitive Analysis', status: 'passed', lastRun: Date.now() }
  ],
  
  aiActionsLog: [
    {
      timestamp: '14:32:15',
      action: 'Auto-assigned driver to ride #RD-8374',
      reasoning: 'Level 4 reasoning - optimal route match',
      level: 4
    },
    {
      timestamp: '14:28:42',
      action: 'Escalated payment issue #PY-2847',
      reasoning: 'Level 3 pattern detection - fraud risk',
      level: 3
    },
    {
      timestamp: '14:25:18',
      action: 'Optimized route for driver #DRV-445',
      reasoning: 'Level 5 multi-step validation - traffic analysis',
      level: 5
    }
  ]
};

function updateHealthMetrics() {
  // Simulate metric updates
  monitoringSystem.healthScore = 98.5 + Math.random() * 1.0;
  monitoringSystem.responseTime = 0.1 + Math.random() * 0.2;
  
  // Update UI if monitoring view is active
  if (currentView === 'aiMonitoring') {
    updateMonitoringDashboard();
  }
}

function updateMonitoringDashboard() {
  // Update metrics display
  const healthEl = document.querySelector('.metric-card .metric-value');
  if (healthEl) {
    healthEl.textContent = monitoringSystem.healthScore.toFixed(1) + '%';
  }
}

function logAIAction(action, details, reasoningLevel) {
  const timestamp = new Date().toLocaleTimeString();
  
  monitoringSystem.aiActionsLog.unshift({
    timestamp,
    action,
    reasoning: `Level ${reasoningLevel} reasoning - ${details}`,
    level: reasoningLevel
  });
  
  // Keep only last 50 actions
  if (monitoringSystem.aiActionsLog.length > 50) {
    monitoringSystem.aiActionsLog = monitoringSystem.aiActionsLog.slice(0, 50);
  }
  
  console.log(`AI Action: ${action} (Level ${reasoningLevel})`);
}

// ============= LIVE EDITOR SYSTEM =============

let editMode = false;
let editorChanges = [];
let currentEditSession = null;

function enableEditMode() {
  editMode = true;
  document.body.classList.add('edit-mode');
  showNotification('Edit mode enabled. You can now modify elements directly.', 'info');
}

function disableEditMode() {
  editMode = false;
  document.body.classList.remove('edit-mode');
  showNotification('Edit mode disabled.', 'info');
}

function switchEditorTab(tabName) {
  // Hide all editor tab contents
  document.querySelectorAll('.editor-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all editor tab buttons
  document.querySelectorAll('.editor-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const targetTab = document.getElementById(tabName + 'EditorTab');
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Set active button
  event.target.classList.add('active');
}

function previewChanges() {
  showNotification('Previewing changes in sandbox environment...', 'info');
  
  setTimeout(() => {
    showNotification('Preview ready! Changes look good.', 'success');
  }, 2000);
}

function saveChanges() {
  if (editorChanges.length === 0) {
    showNotification('No changes to save.', 'warning');
    return;
  }
  
  showNotification(`Saving ${editorChanges.length} changes...`, 'info');
  
  setTimeout(() => {
    showNotification('All changes saved successfully!', 'success');
    editorChanges = [];
  }, 1500);
}

function rollbackChanges() {
  if (editorChanges.length === 0) {
    showNotification('No changes to rollback.', 'warning');
    return;
  }
  
  showNotification(`Rolling back ${editorChanges.length} changes...`, 'warning');
  
  setTimeout(() => {
    showNotification('Changes rolled back successfully!', 'info');
    editorChanges = [];
  }, 1500);
}

// ============= NLP & COMMUNICATION SYSTEM =============

const nlpSystem = {
  chatbots: {
    rider: {
      name: 'RideBot',
      personality: 'helpful_friendly',
      language: 'auto_detect',
      responses: {
        greeting: '¡Hola! Soy RideBot, tu asistente personal. ¿En qué puedo ayudarte hoy?',
        booking: 'Te ayudo a reservar tu viaje. ¿A dónde te gustaría ir?',
        support: 'Entiendo que necesitas ayuda. Déjame conectarte con nuestro equipo de soporte.'
      }
    },
    driver: {
      name: 'DriverAssist',
      personality: 'professional_supportive',
      language: 'auto_detect',
      responses: {
        greeting: '¡Buenos días! Soy tu asistente de conductor. ¿Cómo puedo ayudarte?',
        navigation: 'Te ayudo con la navegación. ¿Necesitas la mejor ruta?',
        earnings: 'Puedes consultar tus ganancias del día en el panel de conductor.'
      }
    }
  },
  
  personalization: {
    userProfiles: new Map(),
    preferences: new Map(),
    communicationHistory: new Map()
  }
};

function processNLPQuery(query, userType = 'rider') {
  const chatbot = nlpSystem.chatbots[userType];
  
  // Simple keyword-based NLP for demo
  if (query.toLowerCase().includes('hola') || query.toLowerCase().includes('hello')) {
    return chatbot.responses.greeting;
  }
  
  if (query.toLowerCase().includes('reservar') || query.toLowerCase().includes('book')) {
    return chatbot.responses.booking;
  }
  
  if (query.toLowerCase().includes('ayuda') || query.toLowerCase().includes('help')) {
    return chatbot.responses.support;
  }
  
  return 'No estoy seguro de cómo ayudarte con eso. ¿Puedes ser más específico?';
}

// Export new AI functions
window.sendAIMessage = sendAIMessage;
window.handleAIChatKeypress = handleAIChatKeypress;
window.switchTokenTab = switchTokenTab;
window.createAutomation = createAutomation;
window.runDiagnostics = runDiagnostics;
window.enableEditMode = enableEditMode;
window.switchEditorTab = switchEditorTab;
window.previewChanges = previewChanges;
window.saveChanges = saveChanges;
window.rollbackChanges = rollbackChanges;

// Initialize AI systems
function initializeAISystems() {
  console.log('Initializing AI systems...');
  
  // Start automated task processing
  setInterval(processAutomatedTasks, 30000); // Every 30 seconds
  
  // Start health monitoring
  setInterval(updateHealthMetrics, 10000); // Every 10 seconds
  
  // Initialize tokenization system
  console.log('Tokenization system initialized');
  console.log('AI reasoning levels: 1-8 available');
  console.log('Automated task management: Active');
  console.log('Continuous monitoring: Active');
  console.log('NLP systems: Ready');
  
  showNotification('🤖 AI systems initialized successfully! Advanced reasoning now available.', 'success');
}

// Auto-initialize AI systems when app loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeAISystems, 2000);
});

// Initialize Application
function initializeApp() {
  console.log('AIRide app initializing...');
  
  // Populate city selector
  populateCitySelector();
  
  // Set up event listeners
  setupEventListeners();
  
  // Show initial view
  showView('home');
  
  console.log('AIRide app initialized successfully');
}

// Populate city selector
function populateCitySelector() {
  const selector = document.getElementById('citySelector');
  if (!selector) return;
  
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.name;
    option.textContent = city.name;
    selector.appendChild(option);
  });
  
  selector.addEventListener('change', (e) => {
    selectedCity = e.target.value;
    console.log('Selected city:', selectedCity);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Auth button
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.addEventListener('click', () => showModal('loginModal'));
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Add funds form
  const addFundsForm = document.getElementById('addFundsForm');
  if (addFundsForm) {
    addFundsForm.addEventListener('submit', handleAddFunds);
  }
  
  // Driver online toggle
  const driverToggle = document.getElementById('driverOnlineToggle');
  if (driverToggle) {
    driverToggle.addEventListener('change', toggleDriverStatus);
  }
  
  // Service toggles for driver
  const ridesServiceToggle = document.getElementById('ridesServiceToggle');
  const foodServiceToggle = document.getElementById('foodServiceToggle');
  
  if (ridesServiceToggle) {
    ridesServiceToggle.addEventListener('change', updateDriverServices);
  }
  
  if (foodServiceToggle) {
    foodServiceToggle.addEventListener('change', updateDriverServices);
  }
  
  // User avatar dropdown
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    userAvatar.addEventListener('click', toggleUserDropdown);
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    
    if (dropdown && !avatar.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

// View management
function showView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });
  
  // Show selected view
  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.classList.remove('hidden');
    previousView = currentView;
    currentView = viewName;
    
    // Special handling for different views
    switch(viewName) {
      case 'services':
        populateServices();
        break;
      case 'wallet':
        populateWallet();
        break;
      case 'adminDashboard':
        populateAdminDashboard();
        break;
      case 'driverDashboard':
        updateDriverDashboard();
        break;
      case 'map':
        showMapView();
        break;
      case 'godModeMap':
        showGodModeMap();
        break;
      case 'userManagement':
        populateUserManagement();
        break;
      case 'driverManagement':
        populateDriverManagement();
        break;
      case 'dispatch':
        setupDispatchSystem();
        break;
    }
    
    // Show/hide SOS button based on view
    const sosButton = document.getElementById('sosButton');
    if (sosButton) {
      if (['services', 'wallet'].includes(viewName) && currentUser) {
        sosButton.classList.remove('hidden');
      } else {
        sosButton.classList.add('hidden');
      }
    }
  }
}

function goBack() {
  showView(previousView);
}

// Authentication
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Simple demo authentication
  if (email && password) {
    currentUser = {
      email: email,
      type: currentUserType,
      name: email.split('@')[0],
      subscriptionPlan: 'Basic'
    };
    
    // Update UI
    updateAuthUI();
    closeModal('loginModal');
    
    // Show appropriate dashboard
    if (currentUserType === 'admin') {
      showView('adminDashboard');
    } else if (currentUserType === 'driver') {
      showView('driverDashboard');
    } else {
      showView('home');
    }
    
    showNotification('Login successful!', 'success');
  }
}

function switchTab(tabName) {
  currentUserType = tabName;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const userAvatar = document.getElementById('userAvatar');
  
  if (currentUser) {
    authBtn.classList.add('hidden');
    userAvatar.classList.remove('hidden');
  } else {
    authBtn.classList.remove('hidden');
    userAvatar.classList.add('hidden');
  }
}

function logout() {
  currentUser = null;
  currentUserType = 'rider';
  updateAuthUI();
  showView('home');
  showNotification('Logged out successfully', 'info');
}

// Modal management
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

// Services
function populateServices() {
  const servicesGrid = document.getElementById('servicesGrid');
  if (!servicesGrid) return;
  
  servicesGrid.innerHTML = '';
  
  services.forEach(service => {
    // Check if service is enabled
    const serviceToggleKey = service.name === 'TAXI' ? 'Taxi Service' : 
                           service.name === 'MOTO TAXI' ? 'Moto Taxi Service' :
                           service.name === 'COLECTIVO' ? 'Colectivo Service' :
                           service.name === 'ERRANDS & TASKS' ? 'Errands & Tasks Service' :
                           'Pickup/Delivery Service';
    
    if (!featureToggles[serviceToggleKey]) return;
    
    const serviceCard = document.createElement('div');
    serviceCard.className = `service-card ${service.color}`;
    serviceCard.onclick = () => requestService(service.id);
    
    serviceCard.innerHTML = `
      <div class="service-icon">
        <i class="fas fa-${service.icon}"></i>
      </div>
      <div class="service-name">${service.name}</div>
      <div class="service-price">${service.price}</div>
      <div class="service-eta">ETA: ${service.eta}</div>
      <div class="service-description">${service.description}</div>
      ${service.isNew ? '<div class="service-badge">NEW</div>' : ''}
    `;
    
    servicesGrid.appendChild(serviceCard);
  });
}

function requestService(serviceId) {
  if (!currentUser) {
    showModal('loginModal');
    return;
  }
  
  if (serviceId === 'errands') {
    showErrandsView();
  } else {
    showMapView(serviceId);
  }
}

function toggleServiceType(type) {
  const ridesSection = document.getElementById('ridesSection');
  const foodSection = document.getElementById('foodSection');
  const ridesToggle = document.getElementById('ridesToggle');
  const foodToggle = document.getElementById('foodToggle');
  
  if (type === 'rides') {
    ridesSection.classList.remove('hidden');
    foodSection.classList.add('hidden');
    ridesToggle.classList.add('active');
    foodToggle.classList.remove('active');
  } else {
    ridesSection.classList.add('hidden');
    foodSection.classList.remove('hidden');
    ridesToggle.classList.remove('active');
    foodToggle.classList.add('active');
  }
}

function showRestaurants(category) {
  showNotification(`Showing ${category} restaurants...`, 'info');
  // This would typically show a list of restaurants
}

// Wallet
function populateWallet() {
  const balanceElement = document.getElementById('walletBalance');
  const transactionList = document.getElementById('transactionList');
  
  if (balanceElement) {
    balanceElement.textContent = walletBalance.toFixed(2);
  }
  
  if (transactionList) {
    transactionList.innerHTML = '';
    
    transactions.forEach(transaction => {
      const transactionItem = document.createElement('div');
      transactionItem.className = 'transaction-item';
      
      transactionItem.innerHTML = `
        <div>
          <div class="transaction-type">${transaction.type}</div>
          <div class="transaction-date">${transaction.date}</div>
        </div>
        <div class="transaction-amount ${transaction.positive ? 'positive' : 'negative'}">
          ${transaction.positive ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}
        </div>
      `;
      
      transactionList.appendChild(transactionItem);
    });
  }
}

function handleAddFunds(e) {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById('fundAmount').value);
  const paymentMethod = document.getElementById('paymentMethod').value;
  
  if (amount && amount > 0) {
    walletBalance += amount;
    
    // Add transaction
    transactions.unshift({
      type: `Top-up via ${paymentMethod}`,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      positive: true
    });
    
    populateWallet();
    closeModal('addFundsModal');
    showNotification(`$${amount.toFixed(2)} added to your wallet`, 'success');
  }
}

// Subscriptions
function subscribe(planName) {
  if (!currentUser) {
    showModal('loginModal');
    return;
  }
  
  currentUser.subscriptionPlan = planName;
  showNotification(`Subscribed to ${planName} plan!`, 'success');
}

// Driver functions
function toggleDriverStatus() {
  isDriverOnline = !isDriverOnline;
  updateDriverDashboard();
  
  const statusText = document.getElementById('driverStatusText');
  if (statusText) {
    statusText.textContent = isDriverOnline ? 'Online' : 'Offline';
  }
  
  showNotification(`Driver status: ${isDriverOnline ? 'Online' : 'Offline'}`, 'info');
}

function updateDriverServices() {
  const ridesService = document.getElementById('ridesServiceToggle').checked;
  const foodService = document.getElementById('foodServiceToggle').checked;
  const smartRoutingSection = document.getElementById('smartRoutingSection');
  
  // Show smart routing when food delivery is enabled
  if (foodService && smartRoutingSection) {
    smartRoutingSection.style.display = 'block';
    hasActiveDelivery = true;
  } else if (smartRoutingSection) {
    smartRoutingSection.style.display = 'none';
    hasActiveDelivery = false;
  }
  
  let message = 'Services updated: ';
  const services = [];
  if (ridesService) services.push('Rides');
  if (foodService) services.push('Food Delivery');
  
  message += services.join(' & ') || 'None';
  showNotification(message, 'info');
}

function updateDriverDashboard() {
  // This would update real-time driver stats
  // For demo purposes, we'll just ensure the UI is consistent
}

function instantPayout() {
  if (!currentUser) return;
  
  showNotification('Instant payout of $342.75 initiated to your bank account', 'success');
}

// ============= ADMIN & GOD MODE FUNCTIONS =============

// Sample data for admin views
const adminData = {
  users: [
    { id: 'USR-001', name: 'John Doe', email: 'john.doe@email.com', plan: 'Premium', trips: 45, rating: 4.8, status: 'active' },
    { id: 'USR-002', name: 'Jane Smith', email: 'jane.smith@email.com', plan: 'Basic', trips: 23, rating: 4.6, status: 'active' },
    { id: 'USR-003', name: 'Carlos Rodriguez', email: 'carlos.r@email.com', plan: 'Driver', trips: 156, rating: 4.9, status: 'suspended' }
  ],
  drivers: [
    { id: 'DRV-001', name: 'Carlos M.', vehicle: 'Toyota Corolla', rating: 4.8, status: 'online', earnings: 245, trips: 12 },
    { id: 'DRV-002', name: 'María G.', vehicle: 'Nissan Sentra', rating: 4.9, status: 'on_ride', earnings: 312, trips: 15 },
    { id: 'DRV-003', name: 'Juan P.', vehicle: 'Honda Civic', rating: 4.7, status: 'offline', earnings: 189, trips: 8 }
  ],
  vehicles: [
    { id: 'VEH-001', driver: 'Carlos M.', plate: 'ABC-1234', lat: 19.4300, lng: -99.1300, status: 'available', heading: 45 },
    { id: 'VEH-002', driver: 'María G.', plate: 'XYZ-5678', lat: 19.4350, lng: -99.1400, status: 'on_ride', heading: 180 },
    { id: 'VEH-003', driver: 'Juan P.', plate: 'DEF-9012', lat: 19.4280, lng: -99.1350, status: 'on_delivery', heading: 270 },
    { id: 'VEH-004', driver: 'Ana L.', plate: 'GHI-3456', lat: 19.4220, lng: -99.1280, status: 'available', heading: 90 },
    { id: 'VEH-005', driver: 'Pedro S.', plate: 'JKL-7890', lat: 19.4380, lng: -99.1320, status: 'on_delivery', heading: 135 }
  ]
};

let godModeMap = null;
let godModeVehicleMarkers = [];
let vehicleUpdateInterval = null;

// God Mode Map Dashboard
function showGodModeMap() {
  showView('godModeMap');
  initializeGodModeMap();
  startVehicleTracking();
}

function initializeGodModeMap() {
  if (godModeMap) return;
  
  godModeMap = L.map('godModeMap').setView([19.4326, -99.1332], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(godModeMap);
  
  // Add initial vehicle markers
  addVehicleMarkers();
}

function addVehicleMarkers() {
  // Clear existing markers
  godModeVehicleMarkers.forEach(marker => godModeMap.removeLayer(marker));
  godModeVehicleMarkers = [];
  
  adminData.vehicles.forEach(vehicle => {
    const color = getVehicleStatusColor(vehicle.status);
    const icon = L.divIcon({
      className: 'god-mode-vehicle-marker',
      html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white;"><i class="fas fa-car"></i></div>`,
      iconSize: [24, 24]
    });
    
    const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
      .addTo(godModeMap)
      .bindPopup(createVehiclePopup(vehicle));
    
    godModeVehicleMarkers.push(marker);
  });
}

function getVehicleStatusColor(status) {
  switch (status) {
    case 'available': return '#10B981';
    case 'on_ride': return '#3B82F6';
    case 'on_delivery': return '#F59E0B';
    case 'offline': return '#6B7280';
    default: return '#6B7280';
  }
}

function createVehiclePopup(vehicle) {
  return `
    <div class="vehicle-popup">
      <h4>${vehicle.driver}</h4>
      <div class="vehicle-info">
        <div class="vehicle-info-item">
          <span>Plate:</span>
          <span>${vehicle.plate}</span>
        </div>
        <div class="vehicle-info-item">
          <span>Status:</span>
          <span class="status-badge ${vehicle.status}">${vehicle.status.replace('_', ' ')}</span>
        </div>
        <div class="vehicle-info-item">
          <span>Earnings Today:</span>
          <span>$${Math.random() * 300 + 100 | 0}</span>
        </div>
      </div>
      <div class="vehicle-popup-actions">
        <button class="btn btn--sm btn--outline" onclick="messageDriver('${vehicle.id}')">Message</button>
        <button class="btn btn--sm btn--outline" onclick="assignTask('${vehicle.id}')">Assign Task</button>
      </div>
    </div>
  `;
}

function startVehicleTracking() {
  if (vehicleUpdateInterval) clearInterval(vehicleUpdateInterval);
  
  vehicleUpdateInterval = setInterval(() => {
    // Simulate vehicle movement
    adminData.vehicles.forEach((vehicle, index) => {
      // Random small movement
      vehicle.lat += (Math.random() - 0.5) * 0.001;
      vehicle.lng += (Math.random() - 0.5) * 0.001;
      vehicle.heading += (Math.random() - 0.5) * 30;
      
      // Update marker position
      if (godModeVehicleMarkers[index]) {
        godModeVehicleMarkers[index].setLatLng([vehicle.lat, vehicle.lng]);
      }
    });
    
    // Update statistics
    updateGodModeStats();
  }, 2500);
}

function updateGodModeStats() {
  const totalVehicles = document.getElementById('totalVehicles');
  const activeRides = document.getElementById('activeRides');
  const activeDeliveries = document.getElementById('activeDeliveries');
  
  if (totalVehicles) totalVehicles.textContent = (8543 + Math.random() * 100 | 0).toLocaleString();
  if (activeRides) activeRides.textContent = (2847 + Math.random() * 50 | 0).toLocaleString();
  if (activeDeliveries) activeDeliveries.textContent = (3295 + Math.random() * 50 | 0).toLocaleString();
}

function filterVehicles(filter) {
  // Filter vehicles on map based on status
  showNotification(`Filtering vehicles: ${filter}`, 'info');
}

function searchVehicles(query) {
  // Search for specific vehicle or driver
  if (query.length > 0) {
    showNotification(`Searching for: ${query}`, 'info');
  }
}

// User Management
function populateUserManagement() {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  adminData.users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.plan}</td>
      <td>${user.trips}</td>
      <td>⭐ ${user.rating}</td>
      <td><span class="status-badge ${user.status}">${user.status}</span></td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="viewUser('${user.id}')">View</button>
        <button class="btn btn--sm btn--secondary" onclick="suspendUser('${user.id}')">Suspend</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Driver Management
function populateDriverManagement() {
  const tableBody = document.getElementById('driversTableBody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  adminData.drivers.forEach(driver => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${driver.id}</td>
      <td>${driver.name}</td>
      <td>${driver.vehicle}</td>
      <td>⭐ ${driver.rating}</td>
      <td><span class="status-badge ${driver.status}">${driver.status.replace('_', ' ')}</span></td>
      <td>$${driver.earnings}</td>
      <td>${driver.trips}</td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="viewDriver('${driver.id}')">View</button>
        <button class="btn btn--sm btn--secondary" onclick="assignTask('${driver.id}')">Assign</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Dispatch System
function setupDispatchSystem() {
  const dispatchForm = document.getElementById('dispatchForm');
  if (dispatchForm) {
    dispatchForm.addEventListener('submit', handleDispatch);
  }
}

function handleDispatch(e) {
  e.preventDefault();
  
  const service = document.getElementById('dispatchService').value;
  const pickup = document.getElementById('dispatchPickup').value;
  const destination = document.getElementById('dispatchDestination').value;
  const driver = document.getElementById('assignDriver').value;
  
  showNotification(`Dispatching ${service} from ${pickup} to ${destination}`, 'success');
}

function sendMessage() {
  const target = document.getElementById('messageTarget').value;
  const message = document.getElementById('messageText').value;
  
  if (!message) {
    showNotification('Please enter a message', 'warning');
    return;
  }
  
  showNotification(`Message sent to ${target}`, 'success');
  document.getElementById('messageText').value = '';
}

// API Settings
function switchPaymentTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.payment-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all buttons
  document.querySelectorAll('.payment-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

function testConnection(service) {
  showNotification(`Testing ${service} connection...`, 'info');
  
  setTimeout(() => {
    showNotification(`${service} connection successful!`, 'success');
  }, 1500);
}

// Support Tickets
function assignTicket(ticketId) {
  showNotification(`Ticket ${ticketId} assigned to you`, 'success');
}

function viewTicket(ticketId) {
  showNotification(`Opening ticket ${ticketId} details`, 'info');
}

function escalateTicket(ticketId) {
  showNotification(`Ticket ${ticketId} escalated to senior support`, 'warning');
}

// Admin utility functions
function viewUser(userId) {
  showNotification(`Opening user profile: ${userId}`, 'info');
}

function suspendUser(userId) {
  showNotification(`User ${userId} suspended`, 'warning');
}

function viewDriver(driverId) {
  showNotification(`Opening driver profile: ${driverId}`, 'info');
}

function messageDriver(driverId) {
  showNotification(`Sending message to driver ${driverId}`, 'info');
}

function assignTask(driverId) {
  showNotification(`Assigning task to driver ${driverId}`, 'info');
}

// Admin functions
function populateAdminDashboard() {
  const featureTogglesGrid = document.getElementById('featureTogglesGrid');
  if (!featureTogglesGrid) return;
  
  featureTogglesGrid.innerHTML = '';
  
  Object.entries(featureToggles).forEach(([feature, enabled]) => {
    const toggleItem = document.createElement('div');
    toggleItem.className = 'feature-toggle';
    
    toggleItem.innerHTML = `
      <span>${feature}</span>
      <label class="switch">
        <input type="checkbox" ${enabled ? 'checked' : ''} 
               onchange="toggleFeature('${feature}', this.checked)">
        <span class="slider"></span>
      </label>
    `;
    
    featureTogglesGrid.appendChild(toggleItem);
  });
  
  // Set admin role
  const adminRole = document.getElementById('adminRole');
  if (adminRole && currentUser) {
    adminRole.textContent = currentUser.type === 'admin' ? 'Super Admin' : 'Admin';
  }
}

function toggleFeature(featureName, enabled) {
  featureToggles[featureName] = enabled;
  
  // If we're on services view, repopulate to reflect changes
  if (currentView === 'services') {
    populateServices();
  }
  
  showNotification(`${featureName} ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function generateReport() {
  showNotification('Generating comprehensive system report...', 'info');
  
  // Simulate report generation
  setTimeout(() => {
    showNotification('Report generated and sent to your email', 'success');
  }, 2000);
}

// User dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Emergency SOS
function triggerSOS() {
  if (!currentUser) return;
  
  // Flash the button
  const sosButton = document.getElementById('sosButton');
  if (sosButton) {
    sosButton.style.animation = 'none';
    sosButton.style.background = '#ffffff';
    sosButton.style.color = '#dc2626';
    
    setTimeout(() => {
      sosButton.style.animation = 'pulse 2s infinite';
      sosButton.style.background = 'var(--color-error)';
      sosButton.style.color = 'white';
    }, 500);
  }
  
  showNotification('🚨 EMERGENCY ALERT SENT! Help is on the way.', 'error');
  
  // Simulate emergency response
  setTimeout(() => {
    showNotification('Emergency contacts notified. Safety team dispatched.', 'info');
  }, 2000);
}

// Notifications
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.background = type === 'success' ? 'var(--color-success)' :
                                 type === 'error' ? 'var(--color-error)' :
                                 type === 'warning' ? 'var(--color-warning)' :
                                 'var(--color-info)';
  notification.style.color = 'white';
  notification.style.padding = 'var(--space-12) var(--space-16)';
  notification.style.borderRadius = 'var(--radius-base)';
  notification.style.boxShadow = 'var(--shadow-lg)';
  notification.style.zIndex = '10000';
  notification.style.maxWidth = '300px';
  notification.style.fontSize = 'var(--font-size-sm)';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease';
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// ================== MAP & LOCATION FLOW =================== //
function showMapView(serviceId) {
  document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
  document.getElementById('mapView').classList.remove('hidden');
  document.getElementById('locationPermissionModal').classList.remove('show');
  initializeLeafletMap();
  beginLocationPermissionFlow();
  prepopulatePickup(serviceId);
  setupSearchAutocomplete();
  document.getElementById('routePanel').classList.add('hidden');
  document.getElementById('ridePanel').classList.add('hidden');
  document.getElementById('driverCard').classList.add('hidden');
}

function beginLocationPermissionFlow() {
  locationPermissionStatus = null;
  userLocation = null;
  document.getElementById('locationPermissionModal').classList.add('show');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationDenied, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 10000
    });
  }
}
function onLocationSuccess(pos) {
  locationPermissionStatus = 'granted';
  userLocation = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: Date.now(),
    address: ''
  };
  document.getElementById('locationPermissionModal').classList.remove('show');
  setUserMarker();
  setPickupLocation(userLocation.latitude, userLocation.longitude);
}
function onLocationDenied() {
  locationPermissionStatus = 'denied';
  document.getElementById('permission-content');
  document.getElementById('locationPermissionModal').classList.remove('show');
  showModal('manualAddressModal');
}
function denyLocation() {
  locationPermissionStatus = 'denied';
  document.getElementById('locationPermissionModal').classList.remove('show');
  showModal('manualAddressModal');
}
function requestLocation() {
  document.getElementById('locationPermissionModal').classList.remove('show');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationDenied, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 8000
    });
  }
}
function useManualAddress() {
  const addr = document.getElementById('manualAddress').value;
  document.getElementById('manualAddressModal').classList.remove('show');
  // Simulate geocoding: Use Zócalo for demo exact center
  userLocation = { latitude: 19.4326, longitude: -99.1332, accuracy: 30, timestamp: Date.now(), address: addr };
  setUserMarker();
  setPickupLocation(userLocation.latitude, userLocation.longitude);
}
// Init map
function initializeLeafletMap() {
  if (map) return;
  map = L.map('leafletMap').setView([19.4326, -99.1332], 13);
  let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  });
  tiles.addTo(map);
}
function recenterMap() {
  if (userLocation) {
    map.setView([userLocation.latitude, userLocation.longitude], 15, { animate: true });
  }
}
function toggleMapLayer() {
  // For demo: toggle between default and dark tiles
  if (!map) return;
  let isDark = map.hasLayer(darkTiles);
  if (!window.darkTiles) {
    window.darkTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
  }
  if (isDark) {
    map.removeLayer(darkTiles);
    window.lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    window.lightTiles.addTo(map);
  } else {
    map.eachLayer(layer => map.removeLayer(layer));
    window.darkTiles.addTo(map);
  }
}
// User marker
function setUserMarker() {
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.circleMarker([userLocation.latitude, userLocation.longitude], {
    radius: 10,
    color: '#1FB8CD',
    fillColor: '#1FB8CD',
    fillOpacity: 0.8,
    weight: 3
  }).addTo(map);
  userMarker.bindTooltip('You are here', { permanent: true });
  map.setView([userLocation.latitude, userLocation.longitude], 15, { animate: true });
  // Animate marker pulse using CSS
  const el = document.querySelector('.leaflet-interactive');
  if (el) el.classList.add('user-marker');
  document.getElementById('pickupAddress').textContent = userLocation.address || 'Locating...';
}
function setPickupLocation(lat, lng) {
  pickupLocation = { latitude: lat, longitude: lng, address: 'Detecting...' };
  if (pickupMarker) map.removeLayer(pickupMarker);
  pickupMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
  pickupMarker.on('dragend', function(e) {
    let pos = e.target.getLatLng();
    pickupLocation.latitude = pos.lat;
    pickupLocation.longitude = pos.lng;
    // Update address (simulate)
    pickupLocation.address = getSimulatedAddress(pos.lat, pos.lng);
    document.getElementById('pickupAddress').textContent = pickupLocation.address;
  });
  document.getElementById('pickupAddress').textContent = getSimulatedAddress(lat, lng);
}
function editPickupLocation() {
  if (pickupMarker) pickupMarker.dragging.enable();
}
function setDropoffLocation(lat, lng) {
  dropoffLocation = { latitude: lat, longitude: lng, address: getSimulatedAddress(lat, lng) };
  if (dropoffMarker) map.removeLayer(dropoffMarker);
  dropoffMarker = L.marker([lat, lng], { draggable: true, icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32] }) }).addTo(map);
  dropoffMarker.on('dragend', function(e) {
    let pos = e.target.getLatLng();
    dropoffLocation.latitude = pos.lat;
    dropoffLocation.longitude = pos.lng;
    dropoffLocation.address = getSimulatedAddress(pos.lat, pos.lng);
    document.getElementById('dropoffAddress').textContent = dropoffLocation.address;
  });
  document.getElementById('dropoffAddress').textContent = dropoffLocation.address;
  document.getElementById('dropoffCard').classList.remove('hidden');
  showRouteOptions();
}
function editDropoffLocation() {
  if (dropoffMarker) dropoffMarker.dragging.enable();
}
function getSimulatedAddress(lat, lng) {
  // Use nearby POIs/common addresses by distance
  let closest = [...mexicoCityPOI].map(p => ({...p, dist: Math.hypot(p.lat-lat, p.lng-lng)})).sort((a,b) => a.dist-b.dist)[0];
  if (closest && closest.dist < 0.01) return closest.name + ', CDMX';
  let addr = commonAddresses[0];
  return addr;
}
function setupSearchAutocomplete() {
  const searchInput = document.getElementById('destinationSearch');
  const suggestionsBox = document.getElementById('searchSuggestions');
  searchInput.addEventListener('input', function() {
    let value = searchInput.value.trim();
    if (!value) {
      suggestionsBox.classList.remove('show');
      suggestionsBox.innerHTML = '';
      return;
    }
    // Simulate suggestions
    let results = [...mexicoCityPOI,
      ...commonAddresses.map(addr=>({name:addr, category:'address', description:'', lat:19.4326, lng:-99.1332}))
    ].filter((p) => p.name.toLowerCase().includes(value.toLowerCase()));
    if (!results.length) {
      suggestionsBox.classList.remove('show');
      suggestionsBox.innerHTML = '';
      return;
    }
    suggestionsBox.classList.add('show');
    suggestionsBox.innerHTML = '';
    results.forEach((item, idx) => {
      let icon = item.category === 'museum' ? 'fa-landmark' : item.category === 'historic' ? 'fa-university' : item.category === 'park' ? 'fa-tree' : 'fa-map-marker-alt';
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `<span class="suggestion-icon"><i class="fas ${icon}"></i></span><span class="suggestion-content"><span class="suggestion-name">${item.name}</span><span class="suggestion-address">${item.description}</span></span>`;
      div.onclick = () => {
        setDropoffLocation(item.lat, item.lng);
        searchInput.value = item.name;
        suggestionsBox.classList.remove('show');
        suggestionsBox.innerHTML = '';
      };
      suggestionsBox.appendChild(div);
    });
  });
  // Hide on blur
  searchInput.addEventListener('blur', function() {
    setTimeout(()=>{ suggestionsBox.classList.remove('show'); },200);
  });
}
function prepopulatePickup(serviceId) {
  // Default pickup is the user's location
  // If not, center on Zócalo
  let lat = userLocation ? userLocation.latitude : 19.4326;
  let lng = userLocation ? userLocation.longitude : -99.1332;
  setPickupLocation(lat,lng);
}
// Route selection
function showRouteOptions() {
  // Simulate 3 routes to dropoff
  if (!pickupLocation || !dropoffLocation) return;
  let panel = document.getElementById('routePanel');
  panel.classList.remove('hidden');
  const routeOpts = document.getElementById('routeOptions');
  routeOpts.innerHTML = '';
  let routes = generateFakeRoutes(pickupLocation, dropoffLocation);
  routes.forEach((route,i) => {
    let div = document.createElement('div');
    div.className = 'route-option';
    div.innerHTML = `<div class="route-header"><span class="route-icon">${routeTypes[i].icon}</span><span class="route-name">${routeTypes[i].name}</span><span class="route-price">$${route.fare} MXN</span></div>
      <div class="route-details">${route.description}</div><div class="route-features">${routeTypes[i].benefits}</div><span class="route-confidence">AI confidence: ${route.confidence}%</span>`;
    div.onclick=()=>selectRoute(route,div);
    routeOpts.appendChild(div);
  });
  document.getElementById('confirmRideBtn').disabled = true;
}
function generateFakeRoutes(pickup,dropoff) {
  // Simulate 'routes' with POIs in between, distances
  let dest = dropoffLocation;
  let base = [ [ pickup.latitude, pickup.longitude ], [ dest.latitude, dest.longitude ] ];
  let routes = [];
  // Fastest: direct, Fast, Moderate traffic
  routes.push({ id: 'route_fastest', type:'fastest', coordinates:[...base], distance: 12.5, duration: 18, fare: 65, traffic: 'moderate', description:'Via Periférico • 18 min • 12.5 km', poi:[mexicoCityPOI[1]], confidence: 92 });
  // Scenic: visits museums/parks
  routes.push({ id: 'route_scenic', type:'scenic', coordinates:[base[0],[19.4260,-99.1860],[19.4204,-99.1820],[dest.latitude,dest.longitude]], distance:15.2, duration:25, fare:78, traffic:'light', description:'Via Reforma (Museums & Monuments) • 25 min • 15.2 km', poi:[mexicoCityPOI[0],mexicoCityPOI[4]], confidence:96 });
  // Economical: avoids tolls
  routes.push({ id: 'route_economical', type:'economical', coordinates:[...base], distance:13.8, duration:22, fare:60, traffic:'moderate', description:'Avoid tolls • 22 min • 13.8 km', poi:[], confidence:90 });
  return routes;
}
function selectRoute(route, el) {
  selectedRoute = route;
  document.querySelectorAll('.route-option').forEach(div=>div.classList.remove('selected'));
  el.classList.add('selected');
  const requestBtn = document.getElementById('requestRideBtn');
  if (requestBtn) {
    requestBtn.disabled = false;
    requestBtn.textContent = `Request ${route.type.charAt(0).toUpperCase() + route.type.slice(1)} Route - $${route.fare} MXN`;
  }
  drawRoutePolyline(route);
}
function drawRoutePolyline(route) {
  routeLines.forEach(line=>map.removeLayer(line));
  routeLines = [];
  routeTypes.forEach((rt,i) => {
    let color = rt.color;
    let line = L.polyline(route.coordinates, { color, weight: route===selectedRoute?7:4, dashArray: route.type==='economical'?"7":"", opacity: route===selectedRoute?0.93:0.60 }).addTo(map);
    routeLines.push(line);
  });
  // Add POI markers
  poiMarkers.forEach(m=>map.removeLayer(m));
  poiMarkers = [];
  if (selectedRoute.type==='scenic' && selectedRoute.poi.length) {
    selectedRoute.poi.forEach(poi=>{
      let m = L.marker([poi.location?poi.location[0]:poi.lat, poi.location?poi.location[1]:poi.lng], { icon: L.divIcon({ className: 'poi-marker', html: '<i class="fas fa-landmark"></i>', iconSize:[24,24] })}).addTo(map);
      m.bindTooltip(`<span>${poi.name}</span><br>${poi.category.charAt(0).toUpperCase()+poi.category.slice(1)}<br>${poi.description||""}`);
      poiMarkers.push(m);
    });
  }
}
function requestRide() {
  if (!selectedRoute) {
    showNotification('Please select a route first', 'warning');
    return;
  }
  
  document.getElementById('routePanel').classList.add('hidden');
  showNotification('Finding nearby drivers...', 'info');
  
  // Simulate finding driver
  setTimeout(() => {
    activateRealTimeTracking();
  }, 2000);
}

function confirmRide() {
  requestRide();
}
function activateRealTimeTracking() {
  bookingState = 'driver_assigned';
  activeDriver = simulatedDrivers[0];
  document.getElementById('driverCard').classList.remove('hidden');
  document.getElementById('driverPhoto').src = activeDriver.photo;
  document.getElementById('driverName').textContent = activeDriver.name;
  document.getElementById('driverRating').innerHTML = `<i class="fas fa-star"></i> ${activeDriver.rating}`;
  document.getElementById('driverVehicle').textContent = `${activeDriver.vehicle} • ${activeDriver.color} • ${activeDriver.plate}`;
  let eta = formatETA(selectedRoute.duration);
  document.getElementById('etaTime').textContent = eta;
  animateDriverApproach();
  startProgressBar(selectedRoute.duration);
}
function animateDriverApproach() {
  // Animate activeDriver from current to pickup
  let start = { lat: activeDriver.lat, lng: activeDriver.lng };
  let end = { lat: pickupLocation.latitude, lng: pickupLocation.longitude };
  let steps = 25;
  let i = 0;
  if (driverMarkers.length) driverMarkers.forEach(m=>map.removeLayer(m));
  driverMarkers = [];
  let marker = L.marker([activeDriver.lat, activeDriver.lng], { icon: L.divIcon({ className:'driver-marker', html:'<i class="fas fa-car"></i>', iconSize: [30,30] }), rotationAngle: activeDriver.heading }).addTo(map);
  driverMarkers.push(marker);
  if (driverAnimInterval) clearInterval(driverAnimInterval);
  driverAnimInterval = setInterval(()=>{
    i++;
    let lat = start.lat + (end.lat-start.lat)*i/steps;
    let lng = start.lng + (end.lng-start.lng)*i/steps;
    marker.setLatLng([lat,lng]);
    marker.setRotationAngle(getHeading(start,end));
    if (i===steps) {
      clearInterval(driverAnimInterval);
      document.getElementById('etaTime').textContent = 'Driver has arrived';
      showNotification('Driver has arrived!', 'success');
      document.getElementById('ridePanel').classList.remove('hidden');
      rideStartTime = Date.now();
      simulateRideProgress();
    }
  }, 2500/steps);
  // Draw route on map
  L.polyline([ [start.lat,start.lng], [end.lat,end.lng]], { color: '#10B981', weight: 6, opacity: 0.6 }).addTo(map);
}
function formatETA(sec) {
  let m = Math.floor(sec/1);
  let s = Math.floor((sec%1)*60);
  return `${m} min ${s} sec`;
}
function getHeading(start,end) {
  let dx = end.lng-start.lng;
  let dy = end.lat-start.lat;
  return Math.atan2(dx,dy)*180/Math.PI;
}
function startProgressBar(totalMinutes) {
  let bar = document.getElementById('progressFill');
  let start = Date.now();
  function updateBar() {
    let elapsed = (Date.now() - start)/60000;
    let percent = Math.min(elapsed/totalMinutes, 1)*100;
    bar.style.width = percent+"%";
  }
  updateBar();
  let interval = setInterval(()=>{
    updateBar();
    if (bar.style.width==='100%') clearInterval(interval);
  },2000);
}
function simulateRideProgress() {
  // Animate driver's location from pickup to dropoff
  let route = selectedRoute;
  let points = [...route.coordinates];
  let marker = driverMarkers[0];
  let idx = 0;
  let stepTime = 1800; // ms
  let totalSteps = points.length*12;
  let distanceTraveled = 0;
  function step() {
    if (idx >= points.length-1) return;
    let [lat1,lng1] = points[idx];
    let [lat2,lng2] = points[idx+1];
    let steps = 12;
    for(let i=1;i<=steps;i++) {
      setTimeout(()=>{
        let lat = lat1 + (lat2-lat1)*i/steps;
        let lng = lng1 + (lng2-lng1)*i/steps;
        marker.setLatLng([lat,lng]);
        marker.setRotationAngle(getHeading({lat:lat1,lng:lng1}, {lat:lat2,lng:lng2}));
        distanceTraveled += haversine(lat1,lng1,lat,lng);
        document.getElementById('distanceTraveled').textContent = distanceTraveled.toFixed(1)+" km";
        let remain = ((points.length-idx-1)*steps-i)*(stepTime/steps)/60000;
        document.getElementById('destinationETA').textContent = `${Math.round(remain)} min`;
        document.getElementById('currentFare').textContent = `$${(selectedRoute.fare *(i/(totalSteps))).toFixed(2)}`;
        if (idx===points.length-2 && i===steps) {
          showNotification('You have arrived!', 'success');
          document.getElementById('ridePanel').classList.add('hidden');
        }
      },stepTime*(idx*steps+i)/steps);
    }
    idx++;
    setTimeout(step, stepTime);
  }
  step();
}
function haversine(lat1,lng1,lat2,lng2) {
  var R=6371e3,a=lat1*Math.PI/180,b=lat2*Math.PI/180,c=(lat2-lat1)*Math.PI/180,d=(lng2-lng1)*Math.PI/180;
  var A=Math.sin(c/2)*Math.sin(c/2)+Math.cos(a)*Math.cos(b)*Math.sin(d/2)*Math.sin(d/2);
  var C=2*Math.atan2(Math.sqrt(A),Math.sqrt(1-A));
  return R*C/1000; // km
}
function callDriver() { showNotification('Calling your driver...', 'info'); }
function messageDriver() { showNotification('Messaging your driver...', 'info'); }
function shareTrip() { showNotification('Trip link shared!', 'success'); }

window.showMapView = showMapView;
window.recenterMap = recenterMap;
window.toggleMapLayer = toggleMapLayer;
window.requestLocation = requestLocation;
window.denyLocation = denyLocation;
window.useManualAddress = useManualAddress;
window.editPickupLocation = editPickupLocation;
window.editDropoffLocation = editDropoffLocation;
window.requestRide = requestRide;
window.confirmRide = confirmRide;
window.callDriver = callDriver;
window.messageDriver = messageDriver;
window.shareTrip = shareTrip;

// ============= WHITE LABEL CONFIGURATION SYSTEM =============

let whiteLabelConfig = {
  branding: {
    appName: 'AIRide',
    companyName: '',
    tagline: '',
    appVersion: '1.0.0',
    iosBundleId: '',
    androidPackage: '',
    primaryColor: '#1FB8CD',
    secondaryColor: '#5E5240',
    accentColor: '#9333EA',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444'
  },
  regional: {
    primaryCountry: 'MX',
    defaultTimezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    defaultLanguage: 'es-MX',
    autoDetectLanguage: true,
    defaultCurrency: 'MXN',
    currencyPosition: 'before',
    enableCrypto: true
  },
  maps: {
    provider: 'openstreetmap',
    style: 'standard',
    googleMapsKey: '',
    mapboxToken: '',
    enablePlaces: true
  },
  payments: {
    stripe: {
      enabled: true,
      environment: 'test',
      publishableKey: '',
      secretKey: '',
      webhookUrl: '',
      webhookSecret: ''
    },
    paypal: {
      enabled: false,
      environment: 'sandbox',
      clientId: '',
      secret: ''
    },
    crypto: {
      processor: 'coinbase',
      apiKey: '',
      acceptedCryptos: ['BTC', 'ETH', 'SOL']
    }
  },
  notifications: {
    sms: {
      provider: 'twilio',
      accountId: '',
      authToken: '',
      fromNumber: ''
    },
    email: {
      provider: 'sendgrid',
      apiKey: '',
      fromEmail: '',
      fromName: ''
    },
    push: {
      oneSignalEnabled: true,
      appId: '',
      apiKey: ''
    }
  },
  integrations: {
    analytics: {
      ga4Enabled: true,
      measurementId: '',
      mixpanelEnabled: false,
      mixpanelToken: ''
    },
    socialLogin: {
      facebookEnabled: false,
      facebookAppId: '',
      facebookSecret: '',
      googleEnabled: false,
      googleClientId: '',
      googleSecret: '',
      appleEnabled: false,
      appleServiceId: '',
      appleTeamId: ''
    },
    storage: {
      provider: 'aws-s3',
      accessKey: '',
      secretKey: '',
      bucket: '',
      region: 'us-east-1'
    }
  },
  legal: {
    termsUrl: '',
    privacyUrl: '',
    supportEmail: '',
    supportPhone: '',
    gdprEnabled: false,
    minAge: '18'
  }
};

// White Label Tab Management
function switchWhiteLabelTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.white-label-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all tab buttons
  document.querySelectorAll('.white-label-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const targetTab = document.getElementById(tabName + 'Tab');
  if (targetTab) {
    targetTab.classList.add('active');
    event.target.classList.add('active');
  }
}

// File Upload Handling
function triggerUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.click();
    input.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        handleFileUpload(file, inputId);
      }
    });
  }
}

function handleFileUpload(file, type) {
  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    showNotification('File size must be less than 2MB', 'warning');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    showNotification(`${type} uploaded successfully`, 'success');
    // In real app, this would upload to storage service
  };
  reader.readAsDataURL(file);
}

// Color Customization
function autoGeneratePalette() {
  const primaryColor = document.getElementById('primaryColor').value;
  
  // Generate complementary colors based on primary
  const hsl = hexToHsl(primaryColor);
  
  // Generate secondary (30 degrees shift)
  const secondaryHsl = { h: (hsl.h + 30) % 360, s: hsl.s * 0.8, l: hsl.l * 0.7 };
  const secondary = hslToHex(secondaryHsl);
  
  // Generate accent (180 degrees shift)
  const accentHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l * 0.9 };
  const accent = hslToHex(accentHsl);
  
  // Update color inputs
  document.getElementById('secondaryColor').value = secondary;
  document.getElementById('accentColor').value = accent;
  
  // Update hex inputs
  document.querySelector('#secondaryColor').nextElementSibling.value = secondary;
  document.querySelector('#accentColor').nextElementSibling.value = accent;
  
  showNotification('Color palette auto-generated!', 'success');
}

function previewColors() {
  showNotification('Color preview applied temporarily', 'info');
  // In real app, would apply colors to preview
}

function applyColors() {
  const colors = {
    primary: document.getElementById('primaryColor').value,
    secondary: document.getElementById('secondaryColor').value,
    accent: document.getElementById('accentColor').value,
    success: document.getElementById('successColor').value,
    warning: document.getElementById('warningColor').value,
    error: document.getElementById('errorColor').value
  };
  
  // Update CSS custom properties
  document.documentElement.style.setProperty('--color-primary', colors.primary);
  document.documentElement.style.setProperty('--color-secondary', colors.secondary);
  
  whiteLabelConfig.branding = { ...whiteLabelConfig.branding, ...colors };
  
  showNotification('Colors applied successfully!', 'success');
}

// API Connection Testing
function testConnection(service) {
  const statusEl = document.getElementById(service + 'Status');
  if (statusEl) {
    statusEl.className = 'connection-status testing';
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing connection...';
  }
  
  // Simulate API test
  setTimeout(() => {
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    if (statusEl) {
      if (success) {
        statusEl.className = 'connection-status success';
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Connection successful!';
      } else {
        statusEl.className = 'connection-status error';
        statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Connection failed. Check credentials.';
      }
    }
    
    showNotification(
      success ? `${service} connection successful` : `${service} connection failed`,
      success ? 'success' : 'error'
    );
  }, 1500);
}

function testSMS() {
  showNotification('Sending test SMS...', 'info');
  
  setTimeout(() => {
    showNotification('Test SMS sent successfully to your number', 'success');
  }, 2000);
}

function testEmail() {
  showNotification('Sending test email...', 'info');
  
  setTimeout(() => {
    showNotification('Test email sent successfully', 'success');
  }, 2000);
}

// Template Management
function loadTemplate(templateName) {
  showNotification(`Loading ${templateName} template...`, 'info');
  
  const templates = {
    mexico: {
      primaryCountry: 'MX',
      defaultCurrency: 'MXN',
      defaultLanguage: 'es-MX',
      enableCrypto: true,
      primaryColor: '#1FB8CD'
    },
    usa: {
      primaryCountry: 'US',
      defaultCurrency: 'USD',
      defaultLanguage: 'en-US',
      enableCrypto: false,
      primaryColor: '#2563EB'
    },
    spain: {
      primaryCountry: 'ES',
      defaultCurrency: 'EUR',
      defaultLanguage: 'es-ES',
      enableCrypto: true,
      gdprEnabled: true,
      primaryColor: '#DC2626'
    }
  };
  
  const template = templates[templateName];
  if (template) {
    // Apply template values to form fields
    Object.keys(template).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = template[key];
        } else {
          element.value = template[key];
        }
      }
    });
    
    setTimeout(() => {
      showNotification(`${templateName} template loaded successfully!`, 'success');
    }, 1000);
  }
}

// Configuration Export/Import
function exportConfiguration() {
  // Collect all form data
  const config = {
    ...whiteLabelConfig,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `airide-config-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('Configuration exported successfully!', 'success');
}

function importConfiguration() {
  const input = document.getElementById('configFileInput');
  if (!input) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.id = 'configFileInput';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
          try {
            const config = JSON.parse(event.target.result);
            applyImportedConfig(config);
            showNotification('Configuration imported successfully!', 'success');
          } catch (error) {
            showNotification('Invalid configuration file', 'error');
          }
        };
        
        reader.readAsText(file);
      }
    });
  }
  
  input.click();
}

function applyImportedConfig(config) {
  whiteLabelConfig = { ...whiteLabelConfig, ...config };
  
  // Apply values to form fields
  Object.keys(config).forEach(section => {
    if (typeof config[section] === 'object') {
      Object.keys(config[section]).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = config[section][key];
          } else {
            element.value = config[section][key];
          }
        }
      });
    }
  });
}

function cloneInstance() {
  showNotification('Cloning instance configuration...', 'info');
  
  setTimeout(() => {
    showNotification('Instance cloned! New deployment URL: https://clone.airide.com', 'success');
  }, 2000);
}

function resetToDefaults() {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    // Reset all form fields
    document.querySelectorAll('#whiteLabelSettingsView input, #whiteLabelSettingsView select').forEach(element => {
      if (element.type === 'checkbox') {
        element.checked = false;
      } else {
        element.value = '';
      }
    });
    
    showNotification('All settings reset to defaults', 'warning');
  }
}

// Setup & Deployment
function continueSetup() {
  showNotification('Continuing setup process...', 'info');
  
  // Switch to next incomplete section
  const pendingItems = document.querySelectorAll('.checklist-item.pending');
  if (pendingItems.length > 0) {
    // Focus on first pending item
    showNotification('Please complete payment gateway configuration', 'info');
    switchWhiteLabelTab('payments');
  } else {
    showNotification('Setup is complete! Ready for deployment.', 'success');
  }
}

function saveWhiteLabelSettings() {
  showNotification('Saving all white label settings...', 'info');
  
  // Collect all form data and save
  const formData = new FormData();
  
  // In real app, this would save to backend
  setTimeout(() => {
    showNotification('All white label settings saved successfully!', 'success');
    updateSetupProgress();
  }, 2000);
}

function previewApp() {
  showNotification('Opening app preview in new window...', 'info');
  
  // In real app, would open preview with applied settings
  setTimeout(() => {
    showNotification('Preview opened! Check the new tab.', 'success');
  }, 1000);
}

function deployApp() {
  if (!confirm('Deploy to production? This will make your app live.')) {
    return;
  }
  
  showNotification('Deploying to production...', 'info');
  
  // Simulate deployment process
  setTimeout(() => {
    showNotification('Deployment in progress... This may take a few minutes.', 'info');
  }, 1000);
  
  setTimeout(() => {
    showNotification('Successfully deployed! Your app is now live at: https://your-app.airide.com', 'success');
    
    // Update checklist
    document.querySelectorAll('.checklist-item').forEach(item => {
      item.classList.add('completed');
      item.classList.remove('pending');
      const icon = item.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-check-circle';
      }
    });
    
    updateSetupProgress(100);
  }, 5000);
}

function updateSetupProgress(percentage = null) {
  if (percentage === null) {
    // Calculate based on completed checklist items
    const total = document.querySelectorAll('.checklist-item').length;
    const completed = document.querySelectorAll('.checklist-item.completed').length;
    percentage = Math.round((completed / total) * 100);
  }
  
  const progressText = document.querySelector('.progress-text strong');
  const progressFill = document.querySelector('.progress-fill-header');
  
  if (progressText) progressText.textContent = `${percentage}%`;
  if (progressFill) progressFill.style.width = `${percentage}%`;
}

// Utility Functions
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return { h: h * 360, s: s, l: l };
}

function hslToHex(hsl) {
  const h = hsl.h / 360;
  const s = hsl.s;
  const l = hsl.l;
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Export White Label functions
window.switchWhiteLabelTab = switchWhiteLabelTab;
window.triggerUpload = triggerUpload;
window.autoGeneratePalette = autoGeneratePalette;
window.previewColors = previewColors;
window.applyColors = applyColors;
window.testConnection = testConnection;
window.testSMS = testSMS;
window.testEmail = testEmail;
window.loadTemplate = loadTemplate;
window.exportConfiguration = exportConfiguration;
window.importConfiguration = importConfiguration;
window.cloneInstance = cloneInstance;
window.resetToDefaults = resetToDefaults;
window.continueSetup = continueSetup;
window.saveWhiteLabelSettings = saveWhiteLabelSettings;
window.previewApp = previewApp;
window.deployApp = deployApp;

// Export admin functions
window.showGodModeMap = showGodModeMap;
window.filterVehicles = filterVehicles;
window.searchVehicles = searchVehicles;
window.populateUserManagement = populateUserManagement;
window.populateDriverManagement = populateDriverManagement;
window.handleDispatch = handleDispatch;
window.sendMessage = sendMessage;
window.switchPaymentTab = switchPaymentTab;
window.assignTicket = assignTicket;
window.viewTicket = viewTicket;
window.escalateTicket = escalateTicket;
window.viewUser = viewUser;
window.suspendUser = suspendUser;
window.viewDriver = viewDriver;
window.messageDriver = messageDriver;
window.assignTask = assignTask;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// ============= MULTI-MARKET ADAPTATION ENGINE =============

const marketAdaptationEngine = {
  verticals: {
    taxi: { name: 'Traditional Taxi', config: 'standard_taxi.json', enabled: true },
    helicopter: { name: 'Helicopter Rides', config: 'helicopter.json', enabled: false },
    limo: { name: 'Luxury Limousine', config: 'luxury_limo.json', enabled: false },
    carpool: { name: 'Carpooling', config: 'carpool.json', enabled: true },
    delivery: { name: 'Delivery Service', config: 'delivery.json', enabled: true },
    homeServices: { name: 'Home Services', config: 'home_services.json', enabled: false }
  },
  
  presets: {
    helicopter: {
      services: ['helicopter_tour', 'helicopter_transfer', 'emergency_medical'],
      pricing: { baseFee: 2500, perMinute: 45, landingFee: 500 },
      restrictions: { weatherDependent: true, licensedPilotsOnly: true },
      ui: { primaryColor: '#FFD700', icon: 'helicopter' }
    },
    limo: {
      services: ['airport_transfer', 'wedding', 'corporate', 'special_events'],
      pricing: { baseFee: 150, perHour: 85, gratuity: 18 },
      features: { champagne: true, redCarpet: true, chauffeur: true },
      ui: { primaryColor: '#1C1C1C', icon: 'car-luxury' }
    },
    homeServices: {
      services: ['cleaning', 'plumbing', 'electrical', 'gardening', 'repairs'],
      pricing: { baseFee: 45, perHour: 35, materialsCost: 'variable' },
      scheduling: { advanceBooking: true, recurringServices: true },
      ui: { primaryColor: '#4CAF50', icon: 'tools' }
    }
  }
};

function adaptToMarket(vertical, region = 'default') {
  const config = marketAdaptationEngine.presets[vertical];
  if (!config) {
    showNotification(`Market configuration for ${vertical} not found`, 'error');
    return;
  }
  
  showNotification(`Adapting platform for ${vertical} market in ${region}...`, 'info');
  
  // Apply AI-recommended configuration
  setTimeout(() => {
    applyMarketConfig(config, vertical);
    showNotification(`Platform successfully adapted for ${vertical} market!`, 'success');
    logAIAction('market_adaptation', `Adapted to ${vertical} in ${region}`, 6);
  }, 2000);
}

function applyMarketConfig(config, vertical) {
  // Update UI colors
  if (config.ui && config.ui.primaryColor) {
    document.documentElement.style.setProperty('--color-primary', config.ui.primaryColor);
  }
  
  // Update services
  if (config.services) {
    console.log(`Services updated for ${vertical}:`, config.services);
  }
  
  // Update pricing
  if (config.pricing) {
    console.log(`Pricing updated for ${vertical}:`, config.pricing);
  }
}

// ============= EXPORT/IMPORT CONFIGURATION SYSTEM =============

function exportLiveConfig() {
  const config = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    aiSystems: aiServices,
    tokenization: tokenizationSystem,
    automation: taskAutomationEngine,
    monitoring: monitoringSystem,
    whiteLabelConfig: whiteLabelConfig,
    marketAdaptation: marketAdaptationEngine,
    features: featureToggles
  };
  
  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `airide-production-config-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('Live production configuration exported!', 'success');
}

function validateConfiguration(config) {
  const validationTests = [
    { test: () => config.aiSystems, message: 'AI systems configuration' },
    { test: () => config.tokenization, message: 'Tokenization configuration' },
    { test: () => config.automation, message: 'Automation rules' },
    { test: () => config.monitoring, message: 'Monitoring setup' },
    { test: () => config.features, message: 'Feature toggles' }
  ];
  
  const results = [];
  
  validationTests.forEach((test, index) => {
    const passed = test.test();
    results.push({
      level: index + 1,
      name: test.message,
      status: passed ? 'passed' : 'failed'
    });
  });
  
  return results;
}

function runValidationSuite() {
  showNotification('Running 8-level validation suite...', 'info');
  
  setTimeout(() => {
    const results = validateConfiguration({
      aiSystems: aiServices,
      tokenization: tokenizationSystem,
      automation: taskAutomationEngine,
      monitoring: monitoringSystem,
      features: featureToggles
    });
    
    const passed = results.filter(r => r.status === 'passed').length;
    const total = results.length;
    
    if (passed === total) {
      showNotification(`✅ All ${total} validation tests passed! System ready for deployment.`, 'success');
    } else {
      showNotification(`⚠️ ${passed}/${total} tests passed. Review failed tests before deployment.`, 'warning');
    }
    
    logAIAction('validation_suite', `${passed}/${total} tests passed`, 8);
  }, 3000);
}

// ============= CAPACITY & SCALING SYSTEM =============

const scalingSystem = {
  metrics: {
    activeUsers: 12543,
    concurrentRides: 2847,
    serverLoad: 68,
    databaseConnections: 245,
    memoryUsage: 72,
    networkLatency: 45
  },
  
  thresholds: {
    serverLoad: 80,
    databaseConnections: 300,
    memoryUsage: 85,
    networkLatency: 100
  },
  
  autoScale: true,
  instances: 8,
  maxInstances: 50
};

function monitorCapacity() {
  // Simulate real-time metrics
  scalingSystem.metrics.activeUsers += Math.floor(Math.random() * 20 - 10);
  scalingSystem.metrics.concurrentRides += Math.floor(Math.random() * 10 - 5);
  scalingSystem.metrics.serverLoad += Math.floor(Math.random() * 10 - 5);
  
  // Check if scaling is needed
  if (scalingSystem.autoScale && scalingSystem.metrics.serverLoad > scalingSystem.thresholds.serverLoad) {
    triggerAutoScale();
  }
}

function triggerAutoScale() {
  if (scalingSystem.instances >= scalingSystem.maxInstances) {
    showNotification('⚠️ Maximum instances reached. Manual intervention required.', 'warning');
    return;
  }
  
  scalingSystem.instances += 2;
  showNotification(`🚀 Auto-scaling triggered: ${scalingSystem.instances} instances now active`, 'info');
  
  logAIAction('auto_scale', `Scaled to ${scalingSystem.instances} instances`, 5);
}

// Start capacity monitoring
setInterval(monitorCapacity, 15000); // Every 15 seconds

// Export new functions
window.adaptToMarket = adaptToMarket;
window.exportLiveConfig = exportLiveConfig;
window.runValidationSuite = runValidationSuite;

// Export functions for global access
window.showView = showView;
window.goBack = goBack;
window.showModal = showModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.toggleServiceType = toggleServiceType;
window.showRestaurants = showRestaurants;
window.subscribe = subscribe;
window.instantPayout = instantPayout;
window.toggleFeature = toggleFeature;
window.generateReport = generateReport;
window.triggerSOS = triggerSOS;
window.logout = logout;

// Initialize admin dashboard setup
document.addEventListener('DOMContentLoaded', () => {
  // Set up any additional event listeners for admin features
  setupDispatchSystem();
});

console.log('AIRide application loaded successfully!');
console.log('Admin features enabled: God Mode Map, User Management, Driver Management, Dispatch System');
console.log('Critical fix applied: Request Ride button functionality implemented');