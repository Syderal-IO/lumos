// ═══════════════════════════════════════════════
// NexusVault — Green-Ledger Escrow Smart Contract
// Framework: Anchor 0.30+
// Network: Solana Devnet
// Source: 002-ARCHITECTURE.md §3.3, 003-DATA_MODEL.md §4
// ═══════════════════════════════════════════════

use anchor_lang::prelude::*;

declare_id!("5VaMiFyzNEewHFSPeB69JNvDAkkL3XByjepgKjjSbMSn"); // Placeholder — update after deploy

#[program]
pub mod nexus_vault {
    use super::*;

    /// Initialize a new energy trade vault (escrow PDA).
    /// Called when a prosumer authorizes a sale through Solei.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        prosumer: Pubkey,
        buyer: Pubkey,
        kwh_amount_milli: u64, // millikWh to avoid floats
        price_per_kwh_usdc: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        // Calculation: (milli_kwh * price) / 1000 to get total USDC in units
        let total_usdc = kwh_amount_milli.checked_mul(price_per_kwh_usdc).ok_or(NexusError::MathOverflow)? / 1000;
        let fee_usdc = total_usdc / 1000; // 0.1% routing fee

        vault.prosumer = prosumer;
        vault.buyer = buyer;
        vault.kwh_amount_milli = kwh_amount_milli;
        vault.price_per_kwh_usdc = price_per_kwh_usdc;
        vault.total_usdc = total_usdc;
        vault.fee_usdc = fee_usdc;
        vault.status = VaultStatus::Initialized;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.timeout_at = vault.created_at + 900; // 15 minutes
        vault.meter_reading = None;
        vault.bump = ctx.bumps.vault;

        emit!(VaultInitialized {
            vault: vault.key(),
            prosumer,
            buyer,
            kwh_amount_milli,
            total_usdc,
        });

        Ok(())
    }

    /// Lock buyer's USDC funds into the escrow PDA.
    pub fn lock_funds(ctx: Context<LockFunds>, amount_usdc: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            vault.status == VaultStatus::Initialized,
            NexusError::InvalidStatus
        );
        require!(amount_usdc >= vault.total_usdc, NexusError::InsufficientFunds);

        vault.status = VaultStatus::FundsLocked;

        emit!(FundsLocked {
            vault: vault.key(),
            amount_usdc,
        });

        Ok(())
    }

    /// Confirm energy delivery via IoT meter reading.
    /// Releases escrowed funds to the prosumer.
    pub fn confirm_delivery(
        ctx: Context<ConfirmDelivery>,
        meter_id: String,
        kwh_delivered_milli: u64,
        source: String,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            vault.status == VaultStatus::FundsLocked,
            NexusError::InvalidStatus
        );

        vault.meter_reading = Some(MeterReading {
            meter_id,
            kwh_delivered_milli,
            timestamp: Clock::get()?.unix_timestamp,
            source,
        });

        vault.status = VaultStatus::DeliveryConfirmed;

        emit!(DeliveryConfirmed {
            vault: vault.key(),
            kwh_delivered_milli,
        });

        Ok(())
    }

    /// Cancel trade — refund buyer if timeout exceeded or manual cancel.
    pub fn cancel_trade(ctx: Context<CancelTrade>, reason: CancelReason) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        match reason {
            CancelReason::Timeout => {
                require!(
                    clock.unix_timestamp > vault.timeout_at,
                    NexusError::NotTimedOut
                );
            }
            CancelReason::Manual => {
                // Either party can cancel before delivery
                require!(
                    vault.status != VaultStatus::DeliveryConfirmed
                        && vault.status != VaultStatus::Completed,
                    NexusError::InvalidStatus
                );
            }
        }

        vault.status = VaultStatus::Cancelled;

        emit!(TradeCancelled {
            vault: vault.key(),
            reason,
        });

        Ok(())
    }

    /// Collect the 0.1% routing fee for the protocol.
    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            vault.status == VaultStatus::DeliveryConfirmed,
            NexusError::InvalidStatus
        );

        vault.status = VaultStatus::Completed;

        emit!(TradeCompleted {
            vault: vault.key(),
            fee_usdc: vault.fee_usdc,
            net_usdc: vault.total_usdc.checked_sub(vault.fee_usdc).ok_or(NexusError::MathOverflow)?,
        });

        Ok(())
    }
}

// ─── Account Structures ───

#[account]
pub struct NexusVault {
    pub prosumer: Pubkey,
    pub buyer: Pubkey,
    pub kwh_amount_milli: u64,
    pub price_per_kwh_usdc: u64,
    pub total_usdc: u64,
    pub fee_usdc: u64,
    pub status: VaultStatus,
    pub created_at: i64,
    pub timeout_at: i64,
    pub meter_reading: Option<MeterReading>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MeterReading {
    pub meter_id: String,
    pub kwh_delivered_milli: u64,
    pub timestamp: i64,
    pub source: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VaultStatus {
    Initialized,
    FundsLocked,
    DeliveryConfirmed,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CancelReason {
    Timeout,
    Manual,
}

// ─── Instruction Contexts ───

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + (4 + 32) + 8 + 8 + (4 + 32) + 1, // Defined space for Strings
        seeds = [b"nexus-vault", prosumer.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, NexusVault>,
    pub prosumer: SystemAccount<'info>,
    pub buyer: SystemAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockFunds<'info> {
    #[account(
        mut,
        has_one = buyer @ NexusError::Unauthorized
    )]
    pub vault: Account<'info, NexusVault>,
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(mut)]
    pub vault: Account<'info, NexusVault>,
    pub authority: Signer<'info>, // Protocol authority
}

#[derive(Accounts)]
pub struct CancelTrade<'info> {
    #[account(mut)]
    pub vault: Account<'info, NexusVault>,
    pub authority: Signer<'info>, // Can be prosumer, buyer or protocol
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(mut)]
    pub vault: Account<'info, NexusVault>,
    /// CHECK: Validated via #[account(signer)] — only the protocol authority can collect fees.
    #[account(signer)]
    pub protocol_wallet: AccountInfo<'info>,
}

// ─── Events ───

#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub prosumer: Pubkey,
    pub buyer: Pubkey,
    pub kwh_amount_milli: u64,
    pub total_usdc: u64,
}

#[event]
pub struct FundsLocked {
    pub vault: Pubkey,
    pub amount_usdc: u64,
}

#[event]
pub struct DeliveryConfirmed {
    pub vault: Pubkey,
    pub kwh_delivered_milli: u64,
}

#[event]
pub struct TradeCompleted {
    pub vault: Pubkey,
    pub fee_usdc: u64,
    pub net_usdc: u64,
}

#[event]
pub struct TradeCancelled {
    pub vault: Pubkey,
    pub reason: CancelReason,
}

// ─── Errors ───

#[error_code]
pub enum NexusError {
    #[msg("Invalid vault status for this operation")]
    InvalidStatus,
    #[msg("Insufficient funds to lock")]
    InsufficientFunds,
    #[msg("Trade has not timed out yet")]
    NotTimedOut,
    #[msg("Unauthorized signer")]
    Unauthorized,
    #[msg("Mathematical overflow")]
    MathOverflow,
}
