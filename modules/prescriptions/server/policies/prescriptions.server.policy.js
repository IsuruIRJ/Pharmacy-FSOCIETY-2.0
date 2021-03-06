'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Prescriptions Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/prescriptions',
      permissions: '*'
    }, {
      resources: '/api/prescriptions/:prescriptionId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/prescriptions',
      permissions: ['get', 'post']
    }, {
      resources: '/api/prescriptions/:prescriptionId',
      permissions: ['get']
    }]
  }, {
    roles: ['doctor'],
    allows: [{
      resources: '/api/prescriptions',
      permissions: ['get', 'post']
    }, {
      resources: '/api/prescriptions/:prescriptionId',
      permissions: ['get']
    }]
  }, {
    roles: ['assistantPharmacist'],
    allows: [{
      resources: '/api/prescriptions',
      permissions: ['get', 'post']
    }, {
      resources: '/api/prescriptions/:prescriptionId',
      permissions: ['get']
    }]
  }, {
    roles: ['chiefPharmacist'],
    allows: [{
      resources: '/api/prescriptions',
      permissions: ['get']
    }, {
      resources: '/api/prescriptions/:prescriptionId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Prescriptions Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['chiefPharmacist','doctor'];

  // If an Prescription is being processed and the current user created it then allow any manipulation
  if (req.prescription && req.user && req.prescription.user && req.prescription.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
