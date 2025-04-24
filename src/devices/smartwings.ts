import * as fz from 'zigbee-herdsman-converters/converters/fromZigbee';
import * as tz from 'zigbee-herdsman-converters/converters/toZigbee';
import * as exposes from 'zigbee-herdsman-converters/lib/exposes';
import * as reporting from 'zigbee-herdsman-converters/lib/reporting';
import {assertString, getFromLookup, getOptions} from 'zigbee-herdsman-converters/lib/utils';

/** @type{import('zigbee-herdsman-converters/lib/types').DefinitionWithExtend | import('zigbee-herdsman-converters/lib/types').DefinitionWithExtend[]} */
/** @type{import('zigbee-herdsman-converters/lib/types').Tz} Tz | import('zigbee-herdsman-converters/lib/types').Tz} */
/** @type{import('zigbee-herdsman-converters/lib/types').Zh} Zh | import('zigbee-herdsman-converters/lib/types').Zh} */

const tzLocal = {
    backwards_cover_state: {
        key: ['state'],
        convertSet: async (entity, key, value, meta) => {
            const lookup = { open: 'downClose', close: 'upOpen', stop: 'stop', on: 'downClose', off: 'upOpen' };
            assertString(value, key);
            value = value.toLowerCase();
            await entity.command('closuresWindowCovering', getFromLookup(value, lookup), {}, getOptions(meta.mapped, entity));
        },
    },
};

const e = exposes.presets;
export default [
    {
        zigbeeModel: ['WM25/L-Z'],
        model: 'WM25L-Z',
        vendor: 'Smartwings',
        description: 'Roller shade',
        fromZigbee: [fz.cover_position_tilt, fz.battery],
        toZigbee: [tzLocal.backwards_cover_state, tz.cover_position_tilt],
        meta: { battery: { dontDividePercentage: true }, coverInverted: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg', 'closuresWindowCovering']);
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
        exposes: [e.cover_position(), e.battery()],
    },
];
