import module from 'module'

const require = module.createRequire(import.meta.url)

export default require
