#!/bin/bash
cd ~/Documents/apic-at-home
git add .
git commit -m "update: $(date '+%Y-%m-%d %H:%M')"
git push
