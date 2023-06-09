import { faker } from '@faker-js/faker';

import knex from '../src/config/db';
import UserDetail from '../src/domain/entities/UserDetail';
import Table from '../src/resources/enums/Table';

import * as userService from '../src/services/userService';
import Role from '../src/resources/enums/Role';
import RideDetail from '../src/domain/entities/RideDetail';
import Ride from '../src/models/Ride';

const tables = [Table.RIDES, Table.USER_SESSIONS, Table.USERS];

export const TEST_EMAIL = faker.internet.email();
export const TEST_PASSWORD = 'passord';

let userData: UserDetail;

/**
 * Create user.
 *
 * @returns Promise
 */
async function createUser(roleId: number, freshUser = false): Promise<UserDetail> {
  switch (roleId) {
    case 1:
      roleId = Role.ADMIN;
      break;
    case 2:
      roleId = Role.NORMAL_USER;
      break;
    case 3:
      roleId = Role.DRIVER_USER;
      break;
    default:
      roleId = Role.NORMAL_USER;
  }

  if (freshUser){
    return await userService.insert({
      email: faker.internet.email(),
      password: TEST_PASSWORD,
      name: faker.name.fullName(),
      roleId
    });
    
  }

  return await userService.insert({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: faker.name.fullName(),
    roleId
  });
}

/**
 * Delete all table's data.
 */
export async function init(): Promise<UserDetail> {
  if (userData) {
    return userData;
  }

  for (const table of tables) {
    await knex(table).del();
  }

  userData = await createUser(Role.NORMAL_USER);

  return userData;
}


/**
 * Create an app customer/admin/driver user
 */
export async function AppUser(role: number, fresh = false): Promise<UserDetail> {
  userData = await createUser(role, fresh);
  return userData;
}

/**
 * Create an app customer/admin/driver user
 */
export async function AppRide(driverId?: number, customerId?: number): Promise<RideDetail> {
  
  return  await Ride.query().insert({
    driverId: driverId ?? (await AppUser(Role.DRIVER_USER, true)).id,
    customerId: customerId ?? (await AppUser(Role.NORMAL_USER, true)).id,
    destination: faker.address.streetAddress(),
    startedFrom: faker.address.streetAddress(),
    fromLatitude: Number(parseFloat(faker.address.latitude())).toFixed(2),
    toLatitude: Number(parseFloat(faker.address.latitude())).toFixed(2),
    fromLongitude: Number(parseFloat(faker.address.longitude())).toFixed(2),
    toLongitude: Number(parseFloat(faker.address.longitude())).toFixed(2),
    startedAt: new Date().toISOString(),
  }).returning('*');
}

/**
 * Get a random element from given array.
 *
 * @param {any[]} list
 * @returns {any}
 */
export function getRandomElement(list: any[]): any {
  return faker.helpers.arrayElement<any>(list);
}
