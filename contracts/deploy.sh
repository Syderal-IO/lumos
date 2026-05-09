#!/bin/bash
# ═══════════════════════════════════════════════
# Green-Ledger — NexusVault Deployment Script
# Deploys the Anchor program to Solana Devnet
# Requires: Rust, Solana CLI, Anchor CLI
# ═══════════════════════════════════════════════

set -euo pipefail

echo "═══════════════════════════════════════"
echo "  NexusVault — Solana Devnet Deployment"
echo "═══════════════════════════════════════"

# ─── 1. Check Prerequisites ───
echo ""
echo "Step 1: Checking prerequisites..."

command -v solana >/dev/null 2>&1 || { echo "❌ solana CLI not found. Install: sh -c \"\$(curl -sSfL https://release.anza.xyz/stable/install)\""; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "❌ anchor CLI not found. Install: cargo install --git https://github.com/coral-xyz/anchor avm --force && avm install 0.30.1 && avm use 0.30.1"; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "❌ cargo not found. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"; exit 1; }

echo "✅ All prerequisites found"
echo "   solana: $(solana --version)"
echo "   anchor: $(anchor --version)"
echo "   cargo:  $(cargo --version)"

# ─── 2. Configure Solana for Devnet ───
echo ""
echo "Step 2: Configuring Solana for Devnet..."
solana config set --url https://api.devnet.solana.com

# Check wallet
WALLET_FILE="$HOME/.config/solana/id.json"
if [ ! -f "$WALLET_FILE" ]; then
  echo "⚠️  No wallet found. Generating new keypair..."
  solana-keygen new --no-passphrase --outfile "$WALLET_FILE"
  echo "📋 New wallet address: $(solana address)"
fi

echo "✅ Wallet: $(solana address)"

# ─── 3. Airdrop SOL ───
echo ""
echo "Step 3: Requesting Devnet SOL airdrop..."
BALANCE=$(solana balance --lamports | awk '{print $1}')
if [ "$BALANCE" -lt 1000000000 ]; then
  echo "   Balance low ($BALANCE lamports), requesting airdrop..."
  solana airdrop 2 || echo "⚠️  Airdrop failed (rate limited). Try again later or use https://faucet.solana.com"
else
  echo "   Balance sufficient: $(solana balance)"
fi

# ─── 4. Build the program ───
echo ""
echo "Step 4: Building NexusVault program..."
cd "$(dirname "$0")"
anchor build

echo "✅ Build complete"
PROGRAM_ID=$(solana address -k target/deploy/nexus_vault-keypair.json)
echo "📋 Program ID: $PROGRAM_ID"

# ─── 5. Update program ID in source ───
echo ""
echo "Step 5: Updating program ID in source files..."
# Update Anchor.toml
sed -i "s/nexus_vault = \".*\"/nexus_vault = \"$PROGRAM_ID\"/" Anchor.toml
# Update lib.rs
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/nexus-vault/src/lib.rs

echo "✅ Program ID updated in Anchor.toml and lib.rs"

# ─── 6. Rebuild with correct program ID ───
echo ""
echo "Step 6: Rebuilding with correct program ID..."
anchor build
echo "✅ Rebuild complete"

# ─── 7. Deploy ───
echo ""
echo "Step 7: Deploying to Devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════"
echo ""
echo "  Program ID:  $PROGRAM_ID"
echo "  Network:     Devnet"
echo "  Explorer:    https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "  Next steps:"
echo "  1. Copy this to your .env.local:"
echo "     NEXUSVAULT_PROGRAM_ID=$PROGRAM_ID"
echo "  2. Export your wallet key for the app:"
echo "     base64 ~/.config/solana/id.json > /tmp/wallet.b64"
echo "     SOLANA_PRIVATE_KEY=\$(cat /tmp/wallet.b64)"
echo ""
