const useMongoAuthState = async (collection, baileys) => {
    const { BufferJSON, initAuthCreds, proto } = baileys;

    const write = (id, data) =>
        collection.updateOne(
            { _id: id },
            { $set: { value: JSON.stringify(data, BufferJSON.replacer) } },
            { upsert: true }
        );

    const read = async (id) => {
        const doc = await collection.findOne({ _id: id });
        return doc ? JSON.parse(doc.value, BufferJSON.reviver) : null;
    };

    const creds = (await read('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await read(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    Object.keys(data).forEach((category) => {
                        Object.keys(data[category]).forEach((id) => {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            tasks.push(value ? write(key, value) : collection.deleteOne({ _id: key }));
                        });
                    });
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => write('creds', creds)
    };
};

module.exports = useMongoAuthState;