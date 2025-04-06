#!/bin/bash

dir='./src/app/game'
nome='game.component'
log='./log.md'

echo '' > $log

for s in html scss ts; do 
   nome_arquivo="${dir}/${nome}.${s}"
   echo "// ${nome}.${s}" >> $log
   cat $nome_arquivo >> $log
   echo '' >> $log
done