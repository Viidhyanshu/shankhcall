# 🌊🌲 शंखcall: Crowdsourced Disaster Monitoring Platform
**Ongoing Project**

A comprehensive, multilingual disaster monitoring and reporting platform that provides unified citizen + social hazard intelligence for both **Ocean** and **Forest** disasters. Built with real-time mapping, sentiment analysis, and role-based access control.

[Live Demo Link] ()

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://shankh-call.netlify.app/land.html)


## 🌟 Key Features

### 🗺️ **Dual Disaster Monitoring**
- **Ocean Disasters**: Tides, floods, tsunamis, coastal damage, high waves, storm surges
- **Forest Disasters**: Tree cutting, forest fires, hunting, poaching, illegal logging, wind damage

### 👥 **Role-Based System**
- **Citizens**: Report hazards, upload media, view real-time alerts
- **Officials**: Verify reports, manage incidents, access verification tools
- **Analysts**: Access NLP tools, sentiment analysis, trend visualization

### 🌍 **Real-Time Intelligence**
- Interactive Leaflet maps with clustering and heatmaps
- Live feed of verified and unverified reports
- Social media sentiment analysis
- Keyword spike detection
- Trend charts and analytics
- 
### 🔐 **Authentication System**
- Firebase Authentication integration
- Email and phone OTP verification
- Social login (Google, Facebook, GitHub, LinkedIn)
- Secure user registration with role selection

### 📱 **Progressive Features**
- Offline support with pending queue sync
- Geolocation integration
- Media upload (images/videos up to 3.5MB)
- Mobile-responsive design
- PWA-ready architecture

## 🛠️ Technologies Used

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **JavaScript (ES6+)**: Vanilla JS for core functionality
- **Leaflet.js**: Interactive mapping
- **Chart.js**: Data visualization and analytics
- **Font Awesome 6.5**: Icon library

### Backend & Services
- **Firebase Authentication**: User management
- **Firestore**: Database for user profiles
- **localStorage**: Offline data persistence

### Libraries & Plugins
- **Leaflet Plugins**:
  - Marker Cluster: Group nearby markers
  - Heat Layer: Density visualization
- **NLP Engine**: Custom keyword classification and sentiment analysis
- **Date/Time**: Native JavaScript datetime handling

## 📁 Project Structure

```
shankhcall/
├── index.html                 # Login/Registration page
├── land.html                  # Disaster type selector (Ocean/Forest)
├── ocean.html                 # Ocean disaster monitoring dashboard
├── forestt.html               # Forest disaster monitoring dashboard
├── cd.html                    # Coffee shop (old project)
├── login.js                   # Firebase authentication logic
├── script.js                  # Registration form handling
├── ocean.js                   # Ocean dashboard JavaScript
├── forest.js                  # Forest dashboard JavaScript
├── ocean.css                  # Ocean dashboard styles
├── forest.css                 # Forest dashboard styles
├── style.css                  # Login/registration styles
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── plugins.js
│   │   └── main.js
│   ├── images/
│   └── menu/
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for CDN resources
- Firebase project (for authentication)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Viidhyanshu/shankhcall.git
cd shankhcall
```

2. **Configure Firebase**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password, Google, Facebook, etc.)
   - Enable Firestore Database
   - Copy your Firebase config to `login.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. **Serve the application**:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Or open directly in browser
open index.html
```

4. **Access the platform**:
   - Login page: `http://localhost:8000/index.html`
   - After login → Disaster selector → Choose Ocean or Forest

## 💻 Usage Guide

### 1. Registration & Login

**Sign Up Flow**:
1. Select your role (Citizen/Official/Analyst)
2. Fill in registration details (name, email, phone)
3. Verify email/phone with OTP
4. Create account

**Sign In**:
- Use email and password
- Or use social login providers

### 2. Disaster Monitoring Dashboard

**Ocean Dashboard** (`ocean.html`):
- Monitor: Tides, floods, tsunamis, coastal damage, high waves
- Focus areas: Chennai, Visakhapatnam, Mumbai, Goa, Kolkata

**Forest Dashboard** (`forestt.html`):
- Monitor: Tree cutting, fires, hunting, poaching, logging, wind damage
- Focus areas: Assam, Nagaland, forest reserve areas

### 3. Reporting Hazards

1. Click "**Report Hazard**" button (Citizens/Officials only)
2. Select event type
3. Add description
4. Use crosshair icon or manually enter coordinates
5. Upload media (optional, up to 6 files)
6. Select language
7. Submit report

### 4. Filtering & Analysis

**Filters Available**:
- Event Type (All/Specific disasters)
- Source (Citizen/Social/Verified)
- Date Range (From/To)
- Location Search

**Analytics Features**:
- Real-time trend charts (reports per hour)
- Sentiment analysis (Positive/Neutral/Negative)
- Keyword spike detection
- Density heatmaps

### 5. Social Media Monitoring

**For Analysts**:
1. Navigate to "Social Monitor" section
2. Click "Load Sample Social Posts" or paste your own
3. Click "Analyze" to run NLP
4. View keyword categorization and sentiment scores
5. Reports auto-populate on map and feed

### 6. Role-Specific Features

**Citizens**:
- Submit reports
- Upload media
- View all reports

**Officials**:
- All citizen features
- Press `V` key to verify latest report
- Access verification controls

**Analysts**:
- Social media NLP analysis
- Advanced filtering
- Trend visualization
- Full data access

## 🎨 Customization

### Changing Color Themes

Edit CSS variables in `ocean.css` or `forest.css`:

```css
:root {
  --bg: #0b1120;        /* Background */
  --accent: #38bdf8;    /* Primary accent */
  --danger: #f43f5e;    /* Danger alerts */
  --ok: #10b981;        /* Success/verified */
}
```

### Adding New Disaster Types

In `ocean.js` or `forest.js`:

```javascript
const KEYWORDS = {
  newType: ['keyword1', 'keyword2', 'हिंदी शब्द'],
  // ... other types
};

const iconByType = {
  newType: 'fa-icon-name',
  // ... other icons
};
```

### Extending Language Support

Add translations in `forest.js`:

```javascript
const I18N = {
  newLang: {
    report: 'Translation',
    filters: 'Translation',
    // ... other keys
  }
};
```

## 📊 Data Flow

```
User Report → localStorage → Map Visualization
                          ↓
                    Live Feed Update
                          ↓
              Sentiment Analysis (NLP)
                          ↓
                  Trend Charts Update
                          ↓
        (When Online) → Sync to Server
```

## 🔒 Security Features

- Firebase Authentication with email verification
- OTP-based phone verification
- reCAPTCHA integration (configurable)
- Role-based access control
- Media file size limits (3.5MB max)
- Input sanitization (XSS prevention)
- Secure password requirements (min 6 chars)

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Offline Support

- Reports queued in `store.pending[]`
- Auto-sync when connection restored
- localStorage persistence
- Graceful fallback for offline maps

## 🎯 Use Cases

1. **Disaster Response Teams**: Real-time monitoring and verification
2. **Forest Department**: Track illegal activities and fires
3. **Coastal Management**: Monitor tides, floods, and damage
4. **NGOs & Volunteers**: Crowdsourced hazard intelligence
5. **Research & Analytics**: Sentiment analysis and trend prediction

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test on multiple browsers
- Ensure i18n support for new strings

## 🐛 Known Issues & Limitations

- Social media integration is simulated (no live API)
- NLP is rule-based (not ML-powered)
- Geolocation requires HTTPS in production
- Media uploads stored in localStorage (size limited)
- No backend server (all data is client-side)

## 🔮 Future Enhancements

- [ ] Real-time notifications (WebSockets/Firebase)
- [ ] Machine learning-based NLP
- [ ] SMS alert integration
- [ ] Admin dashboard for officials
- [ ] Export reports as PDF/CSV
- [ ] Integration with weather APIs
- [ ] Blockchain-based report verification
- [ ] Mobile apps (iOS/Android)
- [ ] Satellite imagery overlay
- [ ] Predictive analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Vidhyanshu**

- GitHub: [@Viidhyanshu](https://github.com/Viidhyanshu)
- Team: Wisdom Weave 

## 🙏 Acknowledgments

- **Leaflet.js**: Excellent mapping library
- **Firebase**: Authentication and database
- **Chart.js**: Beautiful visualizations
- **Font Awesome**: Comprehensive icon set
- **OpenStreetMap**: Map tiles
- **Indian disaster management authorities**: Inspiration and use cases

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Viidhyanshu/shankhcall/issues)
- **Documentation**: See inline code comments

## 🌟 Demo

[Live Demo Link] (https://shankh-call.netlify.app/land.html)


**Made with ❤️ by Team Wisdom Weave**

*Protecting lives through crowdsourced intelligence*

⭐ **Star this repository if you find it useful!**
