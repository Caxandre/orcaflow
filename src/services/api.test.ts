import { describe, expect, it } from 'vitest';
import { applyApiFieldErrors } from './api';

function axiosErrorRejection(errors: { field: string; message: string }[]) {
  return {
    isAxiosError: true,
    response: { status: 422, data: { success: false, message: 'Verifique os dados informados.', errors } },
  };
}

describe('applyApiFieldErrors', () => {
  it('retorna false quando o erro não é um ApiError reconhecível', () => {
    expect(applyApiFieldErrors(new Error('network error'), () => true)).toBe(false);
  });

  it('retorna false quando errors está vazio', () => {
    expect(applyApiFieldErrors(axiosErrorRejection([]), () => true)).toBe(false);
  });

  it('retorna true quando todos os errors são tratados pelo callback', () => {
    const handledFields: string[] = [];
    const result = applyApiFieldErrors(
      axiosErrorRejection([
        { field: 'name', message: 'Nome inválido.' },
        { field: 'email', message: 'E-mail inválido.' },
      ]),
      (fieldError) => {
        handledFields.push(fieldError.field);
        return true;
      },
    );

    expect(result).toBe(true);
    expect(handledFields).toEqual(['name', 'email']);
  });

  it('retorna false quando ao menos um error não é tratado pelo callback', () => {
    const result = applyApiFieldErrors(
      axiosErrorRejection([
        { field: 'name', message: 'Nome inválido.' },
        { field: 'unknown', message: 'Campo desconhecido.' },
      ]),
      (fieldError) => fieldError.field === 'name',
    );

    expect(result).toBe(false);
  });
});
