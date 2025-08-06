# LetterBox - Digital Post Mail Website

A beautiful and interactive digital post mail website that emulates a real postbox experience with letter customization, animations, and delivery features.

## Features

### 🎯 Core Features
- **Pincode-based User System**: Users enter a 6-digit pincode to access their personal mailbox
- **Interactive Postbox**: Beautiful 3D postbox with animations and mail checking functionality
- **Letter Composer**: Multi-step letter writing with comprehensive customization options
- **Letter Viewer**: Animated envelope opening and letter reading experience

### ✨ Letter Customization
- **Color Customization**: 
  - Letter paper color
  - Envelope color
  - Stamp color
- **Design Options**:
  - 4 different stamp designs (Classic, Nature, Modern, Vintage)
  - 4 different envelope designs (Standard, Elegant, Casual, Premium)
- **Delivery Options**: 1 day (Express), 2 days (Standard), 1 week (Economy)

### 🎨 Animations & Interactions
- **Postbox Animations**: Shake, mail drop, and checking animations
- **Envelope Animations**: 3D flap opening, stamp animations
- **Letter Animations**: Fold effects, color transitions
- **UI Animations**: Smooth transitions, hover effects, loading states

### 📱 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Interface**: Modern design with Tailwind CSS
- **Intuitive Navigation**: Step-by-step letter composition
- **Real-time Feedback**: Loading states, success messages, error handling

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Prisma ORM with SQLite
- **UI Components**: Lucide React Icons
- **Color Picker**: React Color
- **Date Handling**: Date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd letterbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup
1. Enter a 6-digit pincode on the welcome screen
2. Your personal mailbox will be created automatically
3. You're now ready to send and receive letters!

### Sending Letters
1. Click "Write Letter" button on the home screen
2. **Step 1**: Enter letter title and content
3. **Step 2**: Add recipient pincode, address, and choose delivery time
4. **Step 3**: Customize colors and designs for your letter
5. Click "Send Letter" to deliver your message

### Receiving Letters
1. Click "Check Mail" on your postbox
2. View your received letters in the letters section
3. Click on any letter to open the envelope and read the content
4. Letters are automatically marked as delivered when opened

## Project Structure

```
letterbox/
├── app/
│   ├── api/                 # API routes
│   │   ├── users/          # User management
│   │   └── letters/        # Letter management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/             # React components
│   ├── PincodeEntry.tsx   # Pincode entry screen
│   ├── HomeScreen.tsx     # Main home screen
│   ├── Postbox.tsx        # Interactive postbox
│   ├── LetterComposer.tsx # Letter writing interface
│   └── LetterViewer.tsx   # Letter reading interface
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Database Schema

### Users
- `id`: Unique identifier
- `pincode`: 6-digit pincode (unique)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Letters
- `id`: Unique identifier
- `title`: Letter title
- `content`: Letter content
- `senderId`: Sender's user ID
- `receiverId`: Receiver's user ID
- `deliveryTime`: Scheduled delivery time
- `isDelivered`: Delivery status
- `letterColor`: Custom letter color
- `envelopeColor`: Custom envelope color
- `stampColor`: Custom stamp color
- `stampDesign`: Stamp design type
- `envelopeDesign`: Envelope design type

### Deliveries
- `id`: Unique identifier
- `letterId`: Associated letter ID
- `status`: Delivery status (pending/in_transit/delivered)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Customization Options

### Stamp Designs
- 🏛️ **Classic**: Traditional post office stamp
- 🌿 **Nature**: Natural elements design
- ⚡ **Modern**: Contemporary geometric design
- 📜 **Vintage**: Retro nostalgic design

### Envelope Designs
- ✉️ **Standard**: Traditional envelope
- 💎 **Elegant**: Sophisticated design
- 📝 **Casual**: Relaxed, friendly design
- 👑 **Premium**: Luxury design

### Delivery Times
- **1 Day**: Express delivery (immediate)
- **2 Days**: Standard delivery (next day)
- **1 Week**: Economy delivery (7 days)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Animations powered by Framer Motion
- Icons from Lucide React
- Database managed with Prisma

---

**Enjoy sending and receiving beautiful digital letters! 📮✨** 