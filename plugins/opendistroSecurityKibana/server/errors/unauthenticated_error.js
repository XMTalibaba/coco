"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnauthenticatedError = void 0;

/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
class UnauthenticatedError extends Error {
  constructor(error) {
    super(`Failed authentication: ${error.message}`);
  }

}

exports.UnauthenticatedError = UnauthenticatedError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVuYXV0aGVudGljYXRlZF9lcnJvci50cyJdLCJuYW1lcyI6WyJVbmF1dGhlbnRpY2F0ZWRFcnJvciIsIkVycm9yIiwiY29uc3RydWN0b3IiLCJlcnJvciIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7QUFlTyxNQUFNQSxvQkFBTixTQUFtQ0MsS0FBbkMsQ0FBeUM7QUFDOUNDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFlO0FBQ3hCLFVBQU8sMEJBQXlCQSxLQUFLLENBQUNDLE9BQVEsRUFBOUM7QUFDRDs7QUFINkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFVuYXV0aGVudGljYXRlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvcjogRXJyb3IpIHtcbiAgICBzdXBlcihgRmFpbGVkIGF1dGhlbnRpY2F0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gIH1cbn1cbiJdfQ==