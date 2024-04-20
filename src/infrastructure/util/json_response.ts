export interface JsonResponse<T = unknown> {
    status: number;
    body?: T;
}

export function success<T>(body?: T): JsonResponse<T> {
    return {
        status: (body !== undefined) ? 200 : 204,
        body,
    };
}

export function error<T>(body?: T, status: number = 400): JsonResponse<T> {
    return {
        status,
        body,
    };
}
