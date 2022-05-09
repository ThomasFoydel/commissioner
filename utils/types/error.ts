
export class ErrorResponse {
  constructor(public message: string, public status: number, public code: number) {}
}

export class MetaMaskError {
  constructor(public message: string, public stack: string, public code: number) {}
}
