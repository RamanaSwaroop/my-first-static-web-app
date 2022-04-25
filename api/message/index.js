// module.exports = async function (context, req) {
//     context.res.json({
//         text: "Hello from the API"
//     });
// };

const fetch = require('node-fetch').default;

// add role names to this object to map them to group ids in your AAD tenant
const roleGroupMappings = {
    'admin': '6ec2bb46-c841-4483-acd4-a526ee358d10',
    'reader': '7e9abbdd-d4f7-4a8f-bde6-e253efba57d0'
};

module.exports = async function (context, req) {
    const user = req.body || {};
    const roles = [];
    
    for (const [role, groupId] of Object.entries(roleGroupMappings)) {
        if (await isUserInGroup(groupId, user.accessToken)) {
            roles.push(role);
        }
    }

    context.res.json({
        roles
    });
}

async function isUserInGroup(groupId, bearerToken) {
    const url = new URL('https://graph.microsoft.com/v1.0/me/memberOf');
    url.searchParams.append('$filter', `id eq '${groupId}'`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}