import { useState, useMemo, useCallback } from "react";
import type { OnrampPartner } from "../components/partnerSelect";
import type { PaymentMethod } from "../components/paymentMethodSelect";

/**
 * Manages partner and payment method selection state.
 * Auto-falls back to the first available option when the stored ID is no longer
 * present in the current list (e.g. after a quote refresh).
 */
export function usePartnerPaymentSelection(
  partners: OnrampPartner[],
  getPaymentMethodsForPartner: (partnerId: string) => PaymentMethod[],
) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(null);

  const selectedPartner = useMemo<OnrampPartner | null>(() => {
    if (partners.length === 0) return null;
    if (selectedPartnerId) {
      const found = partners.find((p) => p.id === selectedPartnerId);
      if (found) return found;
    }
    return partners[0];
  }, [partners, selectedPartnerId]);

  const onPartnerChange = useCallback((partner: OnrampPartner) => {
    setSelectedPartnerId(partner.id);
    // Reset payment method selection when switching partner
    setSelectedPaymentMethodId(null);
  }, []);

  const paymentMethods = useMemo<PaymentMethod[]>(() => {
    if (!selectedPartner) return [];
    return getPaymentMethodsForPartner(selectedPartner.id);
  }, [selectedPartner, getPaymentMethodsForPartner]);

  const selectedPaymentMethod = useMemo<PaymentMethod | null>(() => {
    if (paymentMethods.length === 0) return null;
    if (selectedPaymentMethodId) {
      const found = paymentMethods.find(
        (m) => m.id === selectedPaymentMethodId,
      );
      if (found) return found;
    }
    return paymentMethods[0];
  }, [paymentMethods, selectedPaymentMethodId]);

  const onPaymentMethodChange = useCallback((method: PaymentMethod) => {
    setSelectedPaymentMethodId(method.id);
  }, []);

  return {
    selectedPartner,
    onPartnerChange,
    paymentMethods,
    selectedPaymentMethod,
    onPaymentMethodChange,
  };
}
