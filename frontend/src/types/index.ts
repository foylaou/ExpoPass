
/**
 * Represents a generic API response structure.
 *
 * @template T The type of the data contained in the response.
 */
export interface ApiResponse<T>{
    /**
     * Indicates whether the API request was successful.
     */
    success: boolean;
    /**
     * A message providing additional information about the response,
     * such as success messages or error details.
     */
    message: string;
    /**
     * The actual data returned by the API, if the request was successful.
     * This property is optional and its type is determined by the generic parameter T.
     */
    data?: T
}
