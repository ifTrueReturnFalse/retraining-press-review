"use server";

import {
  GetPressReviewResponseSchema,
  PressReviewResponseSchema,
} from "@/schemas/pressReviewSchema";
import { GetPressReviewResponse, PressReview } from "@/models/pressReviewModel";
import { serverFetch } from "@/services/serverApi";
import { z } from "zod";

/**
 * Server action to retrieve all press reviews associated with a specific conversation.
 * It fetches data from the backend API and validates the response.
 *
 * @param conversationId The ID of the conversation for which to retrieve press reviews.
 * @returns A promise resolving to an object indicating success or failure.
 *          If successful, it contains an array of `PressReview` objects.
 */
export async function getPressReviewsAction(
  conversationId: number,
): Promise<
  { success: true; data: PressReview[] } | { success: false; message: string }
> {
  try {
    const rawData = await serverFetch<GetPressReviewResponse>(
      // Fetches press reviews from the specified conversation endpoint
      `/conversations/${conversationId}/press-review`,
    );

    const parsedResponse = GetPressReviewResponseSchema.safeParse(rawData);
    // Validates the API response structure using Zod

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;
    // Extracts the validated data

    if (!apiData.success || !apiData.data) {
      return {
        success: false,
        message:
          apiData.message || "Impossible de récupérer les revues de presse",
      };
    }

    return { success: true, data: apiData.data };
  } catch (error) {
    console.error("Erreur de chargement des revues de presse : ", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des revues de presse",
    };
  }
}

/**
 * Server action to generate a new press review for a given conversation and theme.
 * It sends a POST request to the backend API and validates the response.
 *
 * @param conversationId The ID of the conversation to associate the press review with.
 * @param theme The theme or topic for which to generate the press review.
 * @returns A promise resolving to an object indicating success or failure.
 *          If successful, it contains the newly generated `PressReview` object.
 */
export async function generatePressReviewAction(
  conversationId: number,
  theme: string,
): Promise<
  { success: true; data: PressReview } | { success: false; message: string }
> {
  try {
    const rawData = await serverFetch(
      // Sends a POST request to generate a press review for the conversation
      `/conversations/${conversationId}/press-review`,
      {
        method: "POST",
        body: JSON.stringify({ theme }),
        // The theme is sent in the request body
      },
    );

    const parsedResponse = PressReviewResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;
    // Extracts the validated data

    if (!apiData.success || !apiData.data) {
      return {
        success: false,
        message:
          apiData.message || "Echec de la génération de la revue de presse",
      };
    }

    return { success: true, data: apiData.data };
  } catch (error) {
    console.error("Erreur génération revue de presse : ", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la génération de la revue de presse",
    };
  }
}
