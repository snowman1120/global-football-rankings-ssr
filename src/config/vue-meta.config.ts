import { createMetaManager } from 'vue-meta';
import { isSSR } from '@/helpers';

export const META_MANAGER = createMetaManager(isSSR(), {
  meta: { nameless: true },
});
