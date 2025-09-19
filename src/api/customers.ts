import { tryCatch } from '../lib/utils'
import { getMiddayClient } from './oauth'

const getCustomers = async () => {
  const midday = getMiddayClient()

  const customers = await tryCatch(midday.customers.list({}))

  return customers.data
}

const getCustomer = async (id: string) => {
  const midday = getMiddayClient()

  const customer = await tryCatch(midday.customers.get({ id }))

  return customer
}

export type CreateCustomerArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['customers']['create']>[0]>

const createCustomer = async (args: CreateCustomerArgs) => {
  const midday = getMiddayClient()

  const createdCustomer = await tryCatch(midday.customers.create(args))

  return createdCustomer
}

const deleteCustomer = async (id: string) => {
  const midday = getMiddayClient()

  const deletedCustomer = await tryCatch(midday.customers.delete({ id }))

  return deletedCustomer
}

export type UpdateCustomerArgs = NonNullable<Parameters<ReturnType<typeof getMiddayClient>['customers']['update']>[0]>

const updateCustomer = async (args: UpdateCustomerArgs) => {
  const midday = getMiddayClient()

  const updatedCustomer = await tryCatch(midday.customers.update(args))

  return updatedCustomer
}

export const customers = {
  list: getCustomers,
  getById: getCustomer,
  create: createCustomer,
  delete: deleteCustomer,
  update: updateCustomer,
}
