# ─────────────────────────────────────────────
# ⛓️ NexusVault — Anchor Build & Deploy
# Solana smart contract builder
# ─────────────────────────────────────────────

FROM solanafoundation/anchor:latest AS builder

WORKDIR /workspace

# ── Copy workspace files ──
COPY Cargo.toml Cargo.lock Anchor.toml ./
COPY programs/ ./programs/

# ── Build the Anchor program ──
RUN anchor build

# ── Verification stage (lightweight) ──
FROM solanafoundation/anchor:latest AS deployer

WORKDIR /workspace

COPY --from=builder /workspace/target/deploy/ ./target/deploy/
COPY --from=builder /workspace/target/idl/ ./target/idl/
COPY --from=builder /workspace/target/types/ ./target/types/
COPY Anchor.toml ./

# Artifacts available at:
#   /workspace/target/deploy/nexus_vault.so
#   /workspace/target/idl/nexus_vault.json
#   /workspace/target/types/nexus_vault.ts

# Deploy requires a keypair mounted at runtime:
#   docker run -v ~/.config/solana:/root/.config/solana nexus-vault anchor deploy --provider.cluster devnet
CMD ["echo", "Build complete. Artifacts in /workspace/target/deploy/. Mount keypair and run: anchor deploy --provider.cluster devnet"]
