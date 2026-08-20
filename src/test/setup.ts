import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Sem `test.globals` no vitest.config.ts (decisão deliberada, ver relatório),
// a limpeza automática de DOM entre testes que `@testing-library/react`
// tenta registrar sozinha não é detectada. Sem isso, um Dialog aberto num
// teste permanece montado no seguinte — o Radix aplica `pointer-events: none`
// no restante da página enquanto o modal está aberto, bloqueando cliques em
// qualquer teste posterior. Confirmado rodando os testes antes de adicionar
// isto (ver relatório final).
afterEach(() => {
  cleanup();
});
