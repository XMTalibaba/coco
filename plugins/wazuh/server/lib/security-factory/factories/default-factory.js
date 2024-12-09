"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultFactory = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DefaultFactory {
  constructor() {
    _defineProperty(this, "platform", '');
  }

  async getCurrentUser(request, context) {
    return {
      username: 'elastic',
      authContext: {
        username: 'elastic'
      }
    };
  }

}

exports.DefaultFactory = DefaultFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlZmF1bHQtZmFjdG9yeS50cyJdLCJuYW1lcyI6WyJEZWZhdWx0RmFjdG9yeSIsImdldEN1cnJlbnRVc2VyIiwicmVxdWVzdCIsImNvbnRleHQiLCJ1c2VybmFtZSIsImF1dGhDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFHTyxNQUFNQSxjQUFOLENBQWdEO0FBQUE7QUFBQSxzQ0FDbEMsRUFEa0M7QUFBQTs7QUFFckQsUUFBTUMsY0FBTixDQUFxQkMsT0FBckIsRUFBNkNDLE9BQTdDLEVBQTZFO0FBQzNFLFdBQU87QUFDTEMsTUFBQUEsUUFBUSxFQUFFLFNBREw7QUFFTEMsTUFBQUEsV0FBVyxFQUFFO0FBQUNELFFBQUFBLFFBQVEsRUFBRTtBQUFYO0FBRlIsS0FBUDtBQUlEOztBQVBvRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElTZWN1cml0eUZhY3RvcnkgfSBmcm9tICcuLi8nO1xuaW1wb3J0IHsgS2liYW5hUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXJDb250ZXh0IH0gZnJvbSAnc3JjL2NvcmUvc2VydmVyJztcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRGYWN0b3J5IGltcGxlbWVudHMgSVNlY3VyaXR5RmFjdG9yeXtcbiAgcGxhdGZvcm06IHN0cmluZyA9ICcnO1xuICBhc3luYyBnZXRDdXJyZW50VXNlcihyZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCBjb250ZXh0PzpSZXF1ZXN0SGFuZGxlckNvbnRleHQpIHtcbiAgICByZXR1cm4geyBcbiAgICAgIHVzZXJuYW1lOiAnZWxhc3RpYycsXG4gICAgICBhdXRoQ29udGV4dDoge3VzZXJuYW1lOiAnZWxhc3RpYycsfVxuICAgIH07XG4gIH1cbn0iXX0=