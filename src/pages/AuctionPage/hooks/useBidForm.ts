import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage, request } from "../../../shared/api/request";
import { convertReaisToCentavos } from "../../../shared/utils";
import type { Lot } from "../AuctionPage.types";
import { getBidSchema, getMinimumBidInCentavos, type BidFormValues } from "../schemas/bid.schema";

type UseBidFormOptions = {
  lot: Lot | null;
  onBidPlaced: (lot: Lot) => Promise<void>;
  onError: (message: string) => void;
};

export function useBidForm({ lot, onBidPlaced, onError }: UseBidFormOptions) {
  const minimumBidRef = useRef(0);
  minimumBidRef.current = lot ? getMinimumBidInCentavos(lot) : 0;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<BidFormValues>({
    // Read the lot through a ref so the minimum follows live bid updates without recreating the form.
    resolver: (values, context, options) =>
      zodResolver(getBidSchema(minimumBidRef.current))(values, context, options),
    mode: "onChange",
    defaultValues: { amount: undefined }
  });

  useEffect(() => {
    reset();
  }, [lot?.id, reset]);

  const submit = handleSubmit(async (values) => {
    if (!lot) return;
    onError("");
    try {
      await request(`/lots/${lot.id}/bids`, {
        method: "POST",
        body: JSON.stringify({ amount: convertReaisToCentavos(values.amount) })
      });
      reset();
      await onBidPlaced(lot);
    } catch (error) {
      onError(getErrorMessage(error));
    }
  });

  return { register, handleSubmit: submit, errors, isSubmitting, isValid, reset };
}
