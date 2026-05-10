"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ─── Translation Dictionaries ───

const dictionaries = {
  es: {
    // Nav
    "nav.home": "Home",
    "nav.chat": "Chat",
    "nav.map": "Mapa",
    "nav.stats": "Stats",
    "nav.lang": "EN",
    // Header
    "header.generated": "kWh gen",
    "header.surplus": "excedente",
    "header.price": "PRECIO",
    "header.price_low": "BAJO ↓",
    "header.price_normal": "NORMAL →",
    // Chat
    "chat.placeholder": "Escribele a Solei...",
    "chat.continue": "Continuar conversación →",
    "chat.welcome": "¡Buenos días! Soy Solei, tu agente de energía.",
    "chat.generating": "Tus paneles están generando",
    "chat.surplus_available": "kWh de excedente disponible para vender en la red vecinal",
    "chat.help": "¿En qué te puedo ayudar?",
    "chat.demo": "▶ DEMO RÁPIDA",
    "chat.error_connection": "Lo siento, hubo un error de conexión. Intenta de nuevo.",
    "chat.error_network": "Error de conexión. Verifica tu internet e intenta de nuevo.",
    "chat.error_sale": "Hubo un problema procesando la venta.",
    "chat.followup": "¿Necesitas algo más? Puedo buscar más compradores o mostrarte el resumen del día.",
    "chat.sim_start": "Iniciando simulación automática...",
    "chat.sim_sell": "Quiero vender mi excedente solar",
    "chat.voice_soon": "Voz (próximamente)",
    // Proposal
    "proposal.sell": "Venta de Energía",
    "proposal.kwh": "kWh",
    "proposal.price": "Precio",
    "proposal.total": "Total",
    "proposal.buyer": "Comprador",
    "proposal.authorize": "Autorizar Venta",
    "proposal.reject": "Rechazar",
    // TX
    "tx.completed": "Venta completada",
    "tx.credited": "acreditados",
    "tx.co2": "kg CO₂",
    "tx.explorer": "Ver en Explorer →",
    "tx.simulated": "TX Simulada (Demo)",
    // Activity
    "activity.recent": "Actividad Reciente",
    "activity.total": "Total",
    // Map
    "map.loading": "Cargando mapa...",
    "map.tx_live": "TX en vivo",
    "map.no_tx": "Sin TX aún",
    "map.total_today": "Total hoy",
    "map.now": "ahora",
    "map.prosumer": "Prosumidor",
    "map.buyer": "Comprador",
    "map.transaction": "Transacción",
    "map.available": "Disponible",
    "map.trading": "En transacción",
    "map.offline": "Desconectado",
    "map.capacity": "Capacidad",
    "map.max_price": "Precio máx",
    "map.kwh_available": "Disponible",
    // Stats
    "stats.today": "Hoy",
    "stats.month": "Este Mes",
    "stats.total": "Total",
    "stats.generated": "Generado",
    "stats.sold": "Vendido",
    "stats.earned": "Ganado",
    "stats.co2_title": "Impacto Ambiental",
    "stats.co2_avoided": "CO₂ Evitado",
    "stats.trees": "Árboles Equiv.",
    "stats.prediction": "Predicción Mensual",
    "stats.badges": "Logros",
    "stats.heatmap": "Actividad de Ventas",
    "stats.weeks": "semanas",
    "stats.sales": "ventas",
    "stats.less": "Menos",
    "stats.more": "Más",
    "stats.history": "Historial",
    "stats.export_csv": "Exportar CSV",
    "stats.leaderboard": "Top Vendedores",
    "stats.production": "Producción 24h",
    "stats.price_history": "Precio $/kWh",
    "stats.roi": "Calculadora ROI",
    "stats.streak": "Racha Diaria",
    "stats.certificate": "Certificado CO₂",
    "stats.regional": "Comparación Regional",
    "stats.vs_avg": "más que el promedio",
    "stats.cnfl_rate": "Tarifa CNFL",
    "stats.more_earnings": "más",
    // Badges
    "badge.first_sale": "1ra Venta",
    "badge.10_trades": "10 Trades",
    "badge.100_kwh": "100 kWh",
    "badge.1_ton_co2": "1 Ton CO₂",
    "badge.top_neighbor": "Top Vecino",
    "badge.100_usdc": "$100 USDC",
    // Weekly Insight
    "insight.title": "Resumen Semanal",
    "insight.best_hour": "Tu mejor hora de producción fue a las 11:00am.",
    "insight.neighbors": "Vendiste a 4 vecinos diferentes esta semana.",
    // Notification
    "notif.title": "Notificaciones",
    "notif.empty": "Sin notificaciones nuevas",
    "notif.buyer_near": "Nuevo comprador cerca de ti",
    "notif.price_up": "El precio subió a $0.10/kWh",
    "notif.badge_unlocked": "¡Badge desbloqueado: Primera Venta!",
    "notif.streak": "¡Racha de 5 días! 🔥",
    // Onboarding
    "onboard.step1": "Este es tu medidor de energía solar",
    "onboard.step2": "Habla con Solei para vender tu excedente",
    "onboard.step3": "Explora tu red vecinal en el mapa",
    "onboard.step4": "Revisa tus estadísticas y logros",
    "onboard.skip": "Saltar",
    "onboard.next": "Siguiente",
    "onboard.done": "¡Empezar!",
    // Wallet
    "wallet.connect": "Conectar Wallet",
    "wallet.connecting": "Conectando...",
    "wallet.connected": "Conectado",
    "wallet.disconnect": "Desconectar",
    "wallet.copy": "Copiar dirección",
    "wallet.copied": "¡Copiado!",
    "wallet.qr": "Mostrar QR",
    // ROI
    "roi.panels": "Paneles Solares",
    "roi.sun_hours": "Horas de Sol / día",
    "roi.monthly": "Ingreso Mensual",
    "roi.annual": "Ingreso Anual",
    "roi.projection": "Proyección 12 meses",
    // Certificate
    "cert.title": "Certificado de Impacto Ambiental",
    "cert.avoided": "CO₂ Evitado",
    "cert.equivalent": "Equivalente a",
    "cert.trees_planted": "árboles plantados",
    "cert.share": "Compartir",
    "cert.download": "Descargar",
    "cert.impact": "Impacto Ambiental",
    "cert.network": "Red Solar P2P",
    "cert.trees_equiv": "Árboles Equiv.",
    "cert.nft_cert": "NFT CERTIFICADO",
    "cert.mint_nft": "Mintear como NFT (cNFT)",
    "cert.minting": "Creando certificado NFT en Solana...",
    "cert.compressed": "cNFT Compressed",
    "cert.view_explorer": "Ver en Solana Explorer",
    "cert.share_cert": "Compartir Certificado",
    "cert.copied": "¡Copiado!",
    // General
    "general.close": "Cerrar",
    "general.loading": "Cargando...",
    "general.error": "Error",
    // Trade UI
    "trade.proposal": "Propuesta de venta",
    "trade.proposal_buy": "Propuesta de compra",
    "trade.energy": "Energía",
    "trade.buyer": "Comprador",
    "trade.seller": "Vendedor",
    "trade.price": "Precio",
    "trade.total": "Total",
    "trade.vs_grid": "vs eléctrica",
    "trade.savings": "ahorro vs red",
    "trade.authorize": "Autorizar",
    "trade.reject": "No",
    "trade.processing": "Procesando...",
    "trade.completed": "Venta completada",
    "trade.completed_buy": "Compra completada",
    "trade.credited": "acreditados",
    "trade.buyer_label": "comprador",
    "trade.view_explorer": "Ver en Explorer →",
    // Chat buy
    "chat.sim_buy": "Quiero comprar energía solar",
    // Landing
    "landing.hero_title_1": "El futuro de la",
    "landing.hero_title_2": "energía",
    "landing.hero_title_3": "es tuyo",
    "landing.hero_sub_1": "Compra o vende energía solar directamente con tus vecinos.",
    "landing.hero_sub_2": "Pagos instantáneos en USDC. Sin intermediarios.",
    "landing.cta_sell": "Comprar · Vender",
    "landing.cta_map": "Explorar Mapa",
    "landing.cta_demo": "Demo Rápida",
    "landing.enter": "Entrar",
    "landing.price": "Precio",
    "landing.badge": "Live en Solana Devnet",
    // Simulation Modal
    "sim.header": "SIMULACIÓN SOLEI",
    "sim.how": "¿Cómo funciona Solei?",
    "sim.intro": "Mira cómo tus paneles solares generan energía, detectan excedente y venden automáticamente a tus vecinos en segundos.",
    "sim.start": "▶ INICIAR SIMULACIÓN",
    "sim.step": "PASO",
    "sim.of": "DE",
    "sim.completed": "✓ SIMULACIÓN COMPLETADA",
    "sim.repeat": "↺ REPETIR",
    "sim.try_solei": "PROBAR CON SOLEI →",
    "sim.step0_title": "Paneles Generando",
    "sim.step0_desc": "Tus paneles solares están captando energía del sol.",
    "sim.step0_d0": "Generación",
    "sim.step0_d1": "Consumo hogar",
    "sim.step1_title": "Excedente Detectado",
    "sim.step1_desc": "Se detectó energía sobrante disponible para vender.",
    "sim.step1_d0": "Excedente",
    "sim.step1_d1": "Precio sugerido",
    "sim.step2_title": "Comprador Encontrado",
    "sim.step2_desc": "Solei encontró al mejor comprador en tu red vecinal.",
    "sim.step2_d0": "Comprador",
    "sim.step2_d1": "Demanda",
    "sim.step3_title": "Venta Autorizada",
    "sim.step3_desc": "La transacción se ejecutó en la red. Pago instantáneo.",
    "sim.step3_d0": "Vendido",
    "sim.step3_d1": "Ingreso",
    "sim.step3_d2": "Fee",
    // Problem / Solution
    "landing.problem_title": "El Problema",
    "landing.problem_desc": "En Latinoamérica, los hogares con paneles solares pierden hasta el 40% de su energía generada, y los vecinos sin paneles pagan tarifas altas a la red eléctrica.",
    "landing.problem_1": "Los excedentes solares se pierden o se venden a precios mínimos a la red eléctrica",
    "landing.problem_2": "Los vecinos no pueden acceder a energía solar limpia y más barata",
    "landing.problem_3": "Los pagos son lentos, opacos y dependen de intermediarios centralizados",
    "landing.solution_title": "La Solución",
    "landing.solution_desc": "Lumos es un marketplace P2P donde cualquiera puede comprar o vender energía solar en su vecindario, con IA conversacional y pagos instantáneos on-chain.",
    "landing.solution_1": "Agente de IA que conecta compradores y vendedores automáticamente",
    "landing.solution_2": "Pagos instantáneos en USDC vía smart contracts en Solana",
    "landing.solution_3": "Marketplace descentralizado — compra energía limpia más barata que la red",
    // Key Features
    "landing.features_badge": "CARACTERÍSTICAS",
    "landing.features_title": "Todo lo que necesitas para comprar y vender energía",
    "landing.feat_1_title": "Agente IA Solei",
    "landing.feat_1_desc": "Un agente conversacional que conecta compradores con vendedores, analiza producción y ejecuta trades con tu aprobación.",
    "landing.feat_2_title": "Smart Contracts",
    "landing.feat_2_desc": "Escrow NexusVault en Solana que garantiza pagos seguros e instantáneos entre vendedor y comprador.",
    "landing.feat_3_title": "Impacto CO₂",
    "landing.feat_3_desc": "Tracking en tiempo real de tu huella de carbono evitada. Certificados verificables de impacto ambiental.",
    "landing.feat_4_title": "Mapa Vecinal",
    "landing.feat_4_desc": "Visualiza tu red de energía local. Ve quién produce, quién compra y las transacciones en tiempo real.",
    "landing.feat_5_title": "Dashboard Analytics",
    "landing.feat_5_desc": "Estadísticas detalladas de producción, ventas, compras e ingresos con predicciones de machine learning.",
    "landing.feat_6_title": "Pagos USDC",
    "landing.feat_6_desc": "Sin volatilidad. Compra o recibe pagos en stablecoin directamente en tu wallet. Fee del 0.001%.",
    // Team
    "landing.team_badge": "EQUIPO",
    "landing.team_title": "Los Fundadores",
    "landing.team_sub": "Construyendo el futuro de la energía descentralizada desde Costa Rica.",
    "landing.team_fabian_role": "CEO & Founder",
    "landing.team_freddy_role": "CTO & Co-Founder",
    // Metrics
    "landing.metrics_badge": "MÉTRICAS EN VIVO",
    "landing.metrics_title_1": "Impacto",
    "landing.metrics_title_2": "real",
    "landing.metrics_energy": "Energía",
    "landing.metrics_co2": "CO₂ Evitado",
    "landing.metrics_trades": "Trades",
    "landing.metrics_vs": "vs CNFL",
    // Code Showcase
    "landing.code_badge": "SMART CONTRACT",
    "landing.code_title_1": "Escrow atómico con",
    "landing.code_title_2": "NexusVault",
    "landing.code_desc": "Cada transacción se ejecuta a través de un escrow on-chain. Los fondos se bloquean y liberan al confirmar la entrega vía IoT.",
    // Integration Mesh
    "landing.stack_badge": "STACK TECNOLÓGICO",
    "landing.stack_title_1": "Arquitectura",
    "landing.stack_title_2": "integrada",
    // ASCII Shader
    "landing.energy_badge": "ENERGÍA COMPUTACIONAL",
    "landing.energy_title_1": "Donde la",
    "landing.energy_title_2": "energía",
    "landing.energy_title_3": "se encuentra con el",
    "landing.energy_title_4": "código",
    // PWA Install
    "pwa.title": "Instalar Lumos",
    "pwa.subtitle": "Acceso directo · Sin tienda · Funciona offline",
    "pwa.button": "Instalar",
    // Footer
    "footer.tagline": "Hecho con ☀ en Costa Rica",
    "footer.map": "Mapa",
  },
  en: {
    // Nav
    "nav.home": "Home",
    "nav.chat": "Chat",
    "nav.map": "Map",
    "nav.stats": "Stats",
    "nav.lang": "ES",
    // Header
    "header.generated": "kWh gen",
    "header.surplus": "surplus",
    "header.price": "PRICE",
    "header.price_low": "LOW ↓",
    "header.price_normal": "NORMAL →",
    // Chat
    "chat.placeholder": "Write to Solei...",
    "chat.continue": "Continue conversation →",
    "chat.welcome": "Good morning! I'm Solei, your energy agent.",
    "chat.generating": "Your panels are generating",
    "chat.surplus_available": "kWh surplus available to sell on the neighborhood grid",
    "chat.help": "How can I help you?",
    "chat.demo": "▶ QUICK DEMO",
    "chat.error_connection": "Sorry, there was a connection error. Please try again.",
    "chat.error_network": "Connection error. Check your internet and try again.",
    "chat.error_sale": "There was a problem processing the sale.",
    "chat.followup": "Need anything else? I can find more buyers or show you the day's summary.",
    "chat.sim_start": "Starting automatic simulation...",
    "chat.sim_sell": "I want to sell my solar surplus",
    "chat.voice_soon": "Voice (coming soon)",
    // Proposal
    "proposal.sell": "Energy Sale",
    "proposal.kwh": "kWh",
    "proposal.price": "Price",
    "proposal.total": "Total",
    "proposal.buyer": "Buyer",
    "proposal.authorize": "Authorize Sale",
    "proposal.reject": "Reject",
    // TX
    "tx.completed": "Sale completed",
    "tx.credited": "credited",
    "tx.co2": "kg CO₂",
    "tx.explorer": "View on Explorer →",
    "tx.simulated": "Simulated TX (Demo)",
    // Activity
    "activity.recent": "Recent Activity",
    "activity.total": "Total",
    // Map
    "map.loading": "Loading map...",
    "map.tx_live": "Live TX",
    "map.no_tx": "No TX yet",
    "map.total_today": "Total today",
    "map.now": "now",
    "map.prosumer": "Prosumer",
    "map.buyer": "Buyer",
    "map.transaction": "Transaction",
    "map.available": "Available",
    "map.trading": "Trading",
    "map.offline": "Offline",
    "map.capacity": "Capacity",
    "map.max_price": "Max price",
    "map.kwh_available": "Available",
    // Stats
    "stats.today": "Today",
    "stats.month": "This Month",
    "stats.total": "Total",
    "stats.generated": "Generated",
    "stats.sold": "Sold",
    "stats.earned": "Earned",
    "stats.co2_title": "Environmental Impact",
    "stats.co2_avoided": "CO₂ Avoided",
    "stats.trees": "Trees Equiv.",
    "stats.prediction": "Monthly Prediction",
    "stats.badges": "Achievements",
    "stats.heatmap": "Sales Activity",
    "stats.weeks": "weeks",
    "stats.sales": "sales",
    "stats.less": "Less",
    "stats.more": "More",
    "stats.history": "History",
    "stats.export_csv": "Export CSV",
    "stats.leaderboard": "Top Sellers",
    "stats.production": "24h Production",
    "stats.price_history": "Price $/kWh",
    "stats.roi": "ROI Calculator",
    "stats.streak": "Daily Streak",
    "stats.certificate": "CO₂ Certificate",
    "stats.regional": "Regional Comparison",
    "stats.vs_avg": "above average",
    "stats.cnfl_rate": "CNFL Rate",
    "stats.more_earnings": "more",
    // Badges
    "badge.first_sale": "1st Sale",
    "badge.10_trades": "10 Trades",
    "badge.100_kwh": "100 kWh",
    "badge.1_ton_co2": "1 Ton CO₂",
    "badge.top_neighbor": "Top Neighbor",
    "badge.100_usdc": "$100 USDC",
    // Weekly Insight
    "insight.title": "Weekly Summary",
    "insight.best_hour": "Your best production hour was at 11:00am.",
    "insight.neighbors": "You sold to 4 different neighbors this week.",
    // Notification
    "notif.title": "Notifications",
    "notif.empty": "No new notifications",
    "notif.buyer_near": "New buyer near you",
    "notif.price_up": "Price rose to $0.10/kWh",
    "notif.badge_unlocked": "Badge unlocked: First Sale!",
    "notif.streak": "5-day streak! 🔥",
    // Onboarding
    "onboard.step1": "This is your solar energy meter",
    "onboard.step2": "Talk to Solei to sell your surplus",
    "onboard.step3": "Explore your neighborhood grid on the map",
    "onboard.step4": "Check your stats and achievements",
    "onboard.skip": "Skip",
    "onboard.next": "Next",
    "onboard.done": "Let's go!",
    // Wallet
    "wallet.connect": "Connect Wallet",
    "wallet.connecting": "Connecting...",
    "wallet.connected": "Connected",
    "wallet.disconnect": "Disconnect",
    "wallet.copy": "Copy address",
    "wallet.copied": "Copied!",
    "wallet.qr": "Show QR",
    // ROI
    "roi.panels": "Solar Panels",
    "roi.sun_hours": "Sun Hours / day",
    "roi.monthly": "Monthly Income",
    "roi.annual": "Annual Income",
    "roi.projection": "12-month Projection",
    // Certificate
    "cert.title": "Environmental Impact Certificate",
    "cert.avoided": "CO₂ Avoided",
    "cert.equivalent": "Equivalent to",
    "cert.trees_planted": "trees planted",
    "cert.share": "Share",
    "cert.download": "Download",
    "cert.impact": "Environmental Impact",
    "cert.network": "Solar P2P Network",
    "cert.trees_equiv": "Trees Equiv.",
    "cert.nft_cert": "NFT CERTIFICATE",
    "cert.mint_nft": "Mint as NFT (cNFT)",
    "cert.minting": "Creating NFT certificate on Solana...",
    "cert.compressed": "cNFT Compressed",
    "cert.view_explorer": "View on Solana Explorer",
    "cert.share_cert": "Share Certificate",
    "cert.copied": "Copied!",
    // General
    "general.close": "Close",
    "general.loading": "Loading...",
    "general.error": "Error",
    // Trade UI
    "trade.proposal": "Sale Proposal",
    "trade.proposal_buy": "Purchase Proposal",
    "trade.energy": "Energy",
    "trade.buyer": "Buyer",
    "trade.seller": "Seller",
    "trade.price": "Price",
    "trade.total": "Total",
    "trade.vs_grid": "vs grid",
    "trade.savings": "savings vs grid",
    "trade.authorize": "Authorize",
    "trade.reject": "No",
    "trade.processing": "Processing...",
    "trade.completed": "Sale completed",
    "trade.completed_buy": "Purchase completed",
    "trade.credited": "credited",
    "trade.buyer_label": "buyer",
    "trade.view_explorer": "View on Explorer →",
    // Chat buy
    "chat.sim_buy": "I want to buy solar energy",
    // Landing
    "landing.hero_title_1": "The future of",
    "landing.hero_title_2": "energy",
    "landing.hero_title_3": "is yours",
    "landing.hero_sub_1": "Buy or sell solar energy directly with your neighbors.",
    "landing.hero_sub_2": "Instant payments in USDC. No middlemen.",
    "landing.cta_sell": "Buy · Sell",
    "landing.cta_map": "Explore Map",
    "landing.cta_demo": "Quick Demo",
    "landing.enter": "Enter",
    "landing.price": "Price",
    "landing.badge": "Live on Solana Devnet",
    // Simulation Modal
    "sim.header": "SOLEI SIMULATION",
    "sim.how": "How does Solei work?",
    "sim.intro": "Watch how your solar panels generate energy, detect surplus, and automatically sell to your neighbors in seconds.",
    "sim.start": "▶ START SIMULATION",
    "sim.step": "STEP",
    "sim.of": "OF",
    "sim.completed": "✓ SIMULATION COMPLETED",
    "sim.repeat": "↺ REPEAT",
    "sim.try_solei": "TRY WITH SOLEI →",
    "sim.step0_title": "Panels Generating",
    "sim.step0_desc": "Your solar panels are capturing energy from the sun.",
    "sim.step0_d0": "Generation",
    "sim.step0_d1": "Home consumption",
    "sim.step1_title": "Surplus Detected",
    "sim.step1_desc": "Surplus energy has been detected and is available to sell.",
    "sim.step1_d0": "Surplus",
    "sim.step1_d1": "Suggested price",
    "sim.step2_title": "Buyer Found",
    "sim.step2_desc": "Solei found the best buyer in your neighborhood grid.",
    "sim.step2_d0": "Buyer",
    "sim.step2_d1": "Demand",
    "sim.step3_title": "Sale Authorized",
    "sim.step3_desc": "The transaction was executed on-chain. Instant payment.",
    "sim.step3_d0": "Sold",
    "sim.step3_d1": "Income",
    "sim.step3_d2": "Fee",
    // Problem / Solution
    "landing.problem_title": "The Problem",
    "landing.problem_desc": "In Latin America, households with solar panels lose up to 40% of their generated energy, and neighbors without panels pay high utility rates.",
    "landing.problem_1": "Solar surplus is lost or sold at minimal prices to the utility grid",
    "landing.problem_2": "Neighbors can't access cheaper, clean solar energy",
    "landing.problem_3": "Payments are slow, opaque, and depend on centralized intermediaries",
    "landing.solution_title": "The Solution",
    "landing.solution_desc": "Lumos is a P2P marketplace where anyone can buy or sell solar energy in their neighborhood, with conversational AI and instant on-chain payments.",
    "landing.solution_1": "AI agent that connects buyers and sellers automatically",
    "landing.solution_2": "Instant USDC payments via smart contracts on Solana",
    "landing.solution_3": "Decentralized marketplace — buy clean energy cheaper than the grid",
    // Key Features
    "landing.features_badge": "FEATURES",
    "landing.features_title": "Everything you need to buy and sell energy",
    "landing.feat_1_title": "Solei AI Agent",
    "landing.feat_1_desc": "A conversational agent that connects buyers with sellers, analyzes production, and executes trades with your approval.",
    "landing.feat_2_title": "Smart Contracts",
    "landing.feat_2_desc": "NexusVault escrow on Solana that guarantees secure and instant payments between seller and buyer.",
    "landing.feat_3_title": "CO₂ Impact",
    "landing.feat_3_desc": "Real-time tracking of your avoided carbon footprint. Verifiable environmental impact certificates.",
    "landing.feat_4_title": "Neighborhood Map",
    "landing.feat_4_desc": "Visualize your local energy grid. See who produces, who buys, and real-time transactions.",
    "landing.feat_5_title": "Analytics Dashboard",
    "landing.feat_5_desc": "Detailed statistics on production, sales, purchases, and income with ML predictions.",
    "landing.feat_6_title": "USDC Payments",
    "landing.feat_6_desc": "No volatility. Buy or receive payments in stablecoin directly to your wallet. 0.001% fee.",
    // Team
    "landing.team_badge": "TEAM",
    "landing.team_title": "The Founders",
    "landing.team_sub": "Building the future of decentralized energy from Costa Rica.",
    "landing.team_fabian_role": "CEO & Founder",
    "landing.team_freddy_role": "CTO & Co-Founder",
    // Metrics
    "landing.metrics_badge": "LIVE METRICS",
    "landing.metrics_title_1": "Real",
    "landing.metrics_title_2": "impact",
    "landing.metrics_energy": "Energy",
    "landing.metrics_co2": "CO₂ Avoided",
    "landing.metrics_trades": "Trades",
    "landing.metrics_vs": "vs CNFL",
    // Code Showcase
    "landing.code_badge": "SMART CONTRACT",
    "landing.code_title_1": "Atomic escrow with",
    "landing.code_title_2": "NexusVault",
    "landing.code_desc": "Every transaction is executed through an on-chain escrow. Funds are locked and released upon IoT delivery confirmation.",
    // Integration Mesh
    "landing.stack_badge": "TECH STACK",
    "landing.stack_title_1": "Integrated",
    "landing.stack_title_2": "architecture",
    // ASCII Shader
    "landing.energy_badge": "COMPUTATIONAL ENERGY",
    "landing.energy_title_1": "Where",
    "landing.energy_title_2": "energy",
    "landing.energy_title_3": "meets",
    "landing.energy_title_4": "code",
    // PWA Install
    "pwa.title": "Install Lumos",
    "pwa.subtitle": "Direct access · No app store · Works offline",
    "pwa.button": "Install",
    // Footer
    "footer.tagline": "Made with ☀ in Costa Rica",
    "footer.map": "Map",
  },
} as const;

type Lang = "es" | "en";
type TransKey = keyof typeof dictionaries.es;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: TransKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  setLang: () => {},
  toggleLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Initialize from localStorage on mount (client only)
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lumos_lang") as Lang | null;
      if (saved === "es" || saved === "en") {
        setLangState(saved);
      }
    }
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lumos_lang", l);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "es" ? "en" : "es";
      if (typeof window !== "undefined") {
        localStorage.setItem("lumos_lang", next);
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TransKey): string => {
      return dictionaries[lang][key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
