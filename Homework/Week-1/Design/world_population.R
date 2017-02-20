library(plyr)
library(ggplot2)
library(matrixStats)

population_data <- read.csv("world_population.csv", header=TRUE, sep=";",stringsAsFactors=FALSE, fileEncoding="latin1")



population_data$average = rowMeans(population_data[,-c(1)], na.rm=TRUE)


sd(population_data[1,-c(1)], na.rm=TRUE)



max(population_data[1,-c(1)], na.rm=TRUE) - min(population_data[1,-c(1)], na.rm=TRUE)

differences = apply(population_data[,-c(1)],1,function(x)  max(x, na.rm=TRUE) - min(x,na.rm=TRUE))

population_data$abs_diff = differences

ggplot(population_data, aes(x=Year,y=abs_diff)
)
cdata <- ddply(population_data, c("Year"), summarise)
