import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { Input } from './Input';
import { SearchInput } from './SearchInput';

describe('FormField', () => {
  it('gera um id quando o filho não possui id nem a prop id é passada', () => {
    render(
      <FormField label="Nome">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.id).toBeTruthy();
  });

  it('a prop id de FormField tem prioridade sobre um id já presente no filho', () => {
    render(
      <FormField label="Nome" id="prop-id">
        <Input id="child-id" />
      </FormField>,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('id', 'prop-id');
  });

  it('sem error, não injeta aria-invalid nem aria-describedby', () => {
    render(
      <FormField label="Nome">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('com error, define aria-invalid e compõe aria-describedby com o valor já existente no filho', () => {
    render(
      <FormField label="Nome" id="nome" error="Informe o nome.">
        <Input aria-describedby="existing-description" />
      </FormField>,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'existing-description nome-error');
    expect(screen.getByText('Informe o nome.')).toHaveAttribute('id', 'nome-error');
  });

  it('com SearchInput como children, id/aria-invalid/aria-describedby caem no <input> real, não no wrapper', () => {
    render(
      <FormField label="Buscar cliente" error="Campo obrigatório.">
        <SearchInput />
      </FormField>,
    );
    const input = screen.getByLabelText('Buscar cliente');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'search');
    expect(input.id).toBeTruthy();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', `${input.id}-error`);
  });
});
