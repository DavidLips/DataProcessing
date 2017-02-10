#!/usr/bin/env python
# Name:
# Student number:
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv
import sys
reload(sys)
sys.setdefaultencoding('UTF-8')

from pattern.web import URL, DOM

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.


    # retrieve titles
    titles = []
    for e in dom.by_tag("h3.lister-item-header"):
        for a in e.by_tag("a"):
            titles.append(a.content.rstrip().strip('\n').encode('latin-1'))

    # retrieve genres
    genres = []
    for e in dom.by_tag("p.text-muted"):
        for s in e.by_tag("span.genre"):
            genres.append(str(s.content.rstrip().strip('\n')))

    # retrieve ratings
    ratings = []
    for e in dom.by_attr(name="ir"):
        for s in e.by_tag("strong"):
            ratings.append(str(s.content))

    #retrieve actors/actresses
    cast = []
    each_cast = []

    for tv in dom.by_tag("div.lister-item-content"):
        each_cast.append(str(tv.by_tag("p")[2].by_tag("a")[0].content))
        each_cast.append(str(tv.by_tag("p")[2].by_tag("a")[1].content))
        each_cast.append(str(tv.by_tag("p")[2].by_tag("a")[2].content))
        each_cast.append(str(tv.by_tag("p")[2].by_tag("a")[3].content))

        each_cast = ', '.join(each_cast)
        cast.append(each_cast)
        each_cast = []

    # retrieve runtimes
    runtimes = []
    for e in dom.by_tag("p.text-muted"):
        for s in e.by_tag("span.runtime"):
            runtimes.append(str(s.content[:2]))

    series_list = zip(titles, ratings, genres, cast, runtimes)

    return series_list 


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # add entries
    for entry in range(len(tvseries)):
        writer.writerow([tvseries[entry][0], tvseries[entry][1], tvseries[entry][2], tvseries[entry][3], tvseries[entry][4]])

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
