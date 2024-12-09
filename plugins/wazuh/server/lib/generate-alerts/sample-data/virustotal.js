"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.malicious = exports.permalink = exports.sourceFile = void 0;

/*
 * Wazuh app - Virustotal sample data
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
// Virustotal
const sourceFile = ['/usr/share/sample/program', "/etc/data/file", "/etc/sample/script", "/root/super-script", "/tmp/virus/notavirus", "/var/opt/amazing-file"];
exports.sourceFile = sourceFile;
const permalink = ['https://www.virustotal.com/gui/file/0a049436fa6c103d4e413fc3a5a8f7152245a36750773a19fdd32f5f6e278347/detection', "https://www.virustotal.com/gui/file/417871ee18a4c782df7ae9b7a64ca060547f7c88a4a405b2fa2487940eaa3c31/detection", "https://www.virustotal.com/gui/file/1bbf37332af75ea682fb4523afc8e61adb22f47f2bf3a8362e310f6d33085a6e/detection", "https://www.virustotal.com/gui/file/e68cda15a436dfcbbabb42c232afe6caa88076c8cb7bc107b6cfe8a08f6044dc/detection", "https://www.virustotal.com/gui/file/509790d92c2c8846bf4ffacfb03c4f8817ac548262c70c13b08ef5cdfba6f596/detection", "https://www.virustotal.com/file/275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f/analysis/1586543564", "https://www.virustotal.com/file/275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f/analysis/1587084411", "https://www.virustotal.com/file/131f95c51cc819465fa1797f6ccacf9d494aaaff46fa3eac73ae63ffbdfd8267/analysis/1586863229", "https://www.virustotal.com/file/275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f/analysis/1586879233", "https://www.virustotal.com/file/275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f/analysis/1586876465"];
exports.permalink = permalink;
const malicious = [0, 1];
exports.malicious = malicious;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpcnVzdG90YWwuanMiXSwibmFtZXMiOlsic291cmNlRmlsZSIsInBlcm1hbGluayIsIm1hbGljaW91cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztBQVlBO0FBQ08sTUFBTUEsVUFBVSxHQUFHLENBQUMsMkJBQUQsRUFBOEIsZ0JBQTlCLEVBQWdELG9CQUFoRCxFQUFzRSxvQkFBdEUsRUFBNEYsc0JBQTVGLEVBQW9ILHVCQUFwSCxDQUFuQjs7QUFDQSxNQUFNQyxTQUFTLEdBQUcsQ0FBQyxnSEFBRCxFQUFtSCxnSEFBbkgsRUFBcU8sZ0hBQXJPLEVBQXVWLGdIQUF2VixFQUF5YyxnSEFBemMsRUFBMmpCLHNIQUEzakIsRUFBbXJCLHNIQUFuckIsRUFBMnlCLHNIQUEzeUIsRUFBbTZCLHNIQUFuNkIsRUFBMmhDLHNIQUEzaEMsQ0FBbEI7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gVmlydXN0b3RhbCBzYW1wbGUgZGF0YVxuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cblxuLy8gVmlydXN0b3RhbFxuZXhwb3J0IGNvbnN0IHNvdXJjZUZpbGUgPSBbJy91c3Ivc2hhcmUvc2FtcGxlL3Byb2dyYW0nLCBcIi9ldGMvZGF0YS9maWxlXCIsIFwiL2V0Yy9zYW1wbGUvc2NyaXB0XCIsIFwiL3Jvb3Qvc3VwZXItc2NyaXB0XCIsIFwiL3RtcC92aXJ1cy9ub3RhdmlydXNcIiwgXCIvdmFyL29wdC9hbWF6aW5nLWZpbGVcIl07XG5leHBvcnQgY29uc3QgcGVybWFsaW5rID0gWydodHRwczovL3d3dy52aXJ1c3RvdGFsLmNvbS9ndWkvZmlsZS8wYTA0OTQzNmZhNmMxMDNkNGU0MTNmYzNhNWE4ZjcxNTIyNDVhMzY3NTA3NzNhMTlmZGQzMmY1ZjZlMjc4MzQ3L2RldGVjdGlvbicsIFwiaHR0cHM6Ly93d3cudmlydXN0b3RhbC5jb20vZ3VpL2ZpbGUvNDE3ODcxZWUxOGE0Yzc4MmRmN2FlOWI3YTY0Y2EwNjA1NDdmN2M4OGE0YTQwNWIyZmEyNDg3OTQwZWFhM2MzMS9kZXRlY3Rpb25cIiwgXCJodHRwczovL3d3dy52aXJ1c3RvdGFsLmNvbS9ndWkvZmlsZS8xYmJmMzczMzJhZjc1ZWE2ODJmYjQ1MjNhZmM4ZTYxYWRiMjJmNDdmMmJmM2E4MzYyZTMxMGY2ZDMzMDg1YTZlL2RldGVjdGlvblwiLCBcImh0dHBzOi8vd3d3LnZpcnVzdG90YWwuY29tL2d1aS9maWxlL2U2OGNkYTE1YTQzNmRmY2JiYWJiNDJjMjMyYWZlNmNhYTg4MDc2YzhjYjdiYzEwN2I2Y2ZlOGEwOGY2MDQ0ZGMvZGV0ZWN0aW9uXCIsIFwiaHR0cHM6Ly93d3cudmlydXN0b3RhbC5jb20vZ3VpL2ZpbGUvNTA5NzkwZDkyYzJjODg0NmJmNGZmYWNmYjAzYzRmODgxN2FjNTQ4MjYyYzcwYzEzYjA4ZWY1Y2RmYmE2ZjU5Ni9kZXRlY3Rpb25cIiwgXCJodHRwczovL3d3dy52aXJ1c3RvdGFsLmNvbS9maWxlLzI3NWEwMjFiYmZiNjQ4OWU1NGQ0NzE4OTlmN2RiOWQxNjYzZmM2OTVlYzJmZTJhMmM0NTM4YWFiZjY1MWZkMGYvYW5hbHlzaXMvMTU4NjU0MzU2NFwiLCBcImh0dHBzOi8vd3d3LnZpcnVzdG90YWwuY29tL2ZpbGUvMjc1YTAyMWJiZmI2NDg5ZTU0ZDQ3MTg5OWY3ZGI5ZDE2NjNmYzY5NWVjMmZlMmEyYzQ1MzhhYWJmNjUxZmQwZi9hbmFseXNpcy8xNTg3MDg0NDExXCIsIFwiaHR0cHM6Ly93d3cudmlydXN0b3RhbC5jb20vZmlsZS8xMzFmOTVjNTFjYzgxOTQ2NWZhMTc5N2Y2Y2NhY2Y5ZDQ5NGFhYWZmNDZmYTNlYWM3M2FlNjNmZmJkZmQ4MjY3L2FuYWx5c2lzLzE1ODY4NjMyMjlcIiwgXCJodHRwczovL3d3dy52aXJ1c3RvdGFsLmNvbS9maWxlLzI3NWEwMjFiYmZiNjQ4OWU1NGQ0NzE4OTlmN2RiOWQxNjYzZmM2OTVlYzJmZTJhMmM0NTM4YWFiZjY1MWZkMGYvYW5hbHlzaXMvMTU4Njg3OTIzM1wiLCBcImh0dHBzOi8vd3d3LnZpcnVzdG90YWwuY29tL2ZpbGUvMjc1YTAyMWJiZmI2NDg5ZTU0ZDQ3MTg5OWY3ZGI5ZDE2NjNmYzY5NWVjMmZlMmEyYzQ1MzhhYWJmNjUxZmQwZi9hbmFseXNpcy8xNTg2ODc2NDY1XCJdO1xuZXhwb3J0IGNvbnN0IG1hbGljaW91cyA9IFswLCAxXTsiXX0=