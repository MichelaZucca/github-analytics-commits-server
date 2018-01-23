// Déclare la dépendance sur GithubGraphQl
const GithubGraphQLApi = require('node-github-graphql');

// Déclare l'agent
class Agent {
  // Constructeur
  constructor(url, token) {
    this.api = new GithubGraphQLApi({
      url,
      token,
      debug: false,
    });
  }

  getAllData(owner, name, numberElementToFetch, socket) {
    return new Promise((resolve, reject) => {
      let commitsContent = [];
      function fetchAndProcessPage(api, numberElement, cursor) {
        let additionalParameters = '';
        if (cursor != null) {
          additionalParameters = `, after: "${cursor}"`;
        }

        api.query(`
        query ($owner: String!, $name: String!, $numberToFetch: Int!)
        {
            repository(owner: $owner, name: $name) {
              nameWithOwner
              description
              commitComments(first: $numberToFetch ${additionalParameters}){
                totalCount
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  author {
                    login
                    avatarUrl
                  }
                  commit {
                    message
                    additions
                    deletions
                  }
                }
              }
            }
          }`, {
          owner,
          name,
          numberToFetch: numberElement,
        }).then((res) => {
          // En cas de succès
          // Ajoute les résultats
          commitsContent = commitsContent.concat(res.data.repository.commitComments.nodes);

          // filtre par user
          const mapAdd = new Map();
          const mapDel = new Map();
          commitsContent.forEach((element) => {
            const author = element.author.login;
            const nbAdd = element.commit.additions;
            const nbDel = element.commit.deletions;
            if (mapAdd.has(author)) {
              mapDel.set(
                author,
                {
                  numberOfCommits: (mapDel.get(author).numberOfCommits + 1),
                  numberOfLines: (mapDel.get(author).numberOfLines) + nbDel,
                },
              );
              mapAdd.set(
                author,
                {
                  numberOfCommits: (mapAdd.get(author).numberOfCommits + 1),
                  numberOfLines: (mapAdd.get(author).numberOfLines) + nbAdd,
                },
              );
            } else {
              mapDel.set(author, { numberOfCommits: 1, numberOfLines: nbDel });
              mapAdd.set(author, { numberOfCommits: 1, numberOfLines: nbAdd });
            }
          });


          // Object qui sera renvoyé au serveur
          const data = {
            completed: false,
            name: res.data.repository.nameWithOwner,
            description: res.data.repository.description,
            totalCommits: res.data.repository.commitComments.totalCount,
            commits: commitsContent,
            map: { commitsAdd: Array.from(mapAdd), commitsDel: Array.from(mapDel) },
          };

          const hasNextPage = res.data.repository.commitComments.pageInfo.hasNextPage;
          // console.log(hasNextPage);
          // Pagination, récupère toutes les pages les unes après les autres
          if (hasNextPage) {
            const cursorId = res.data.repository.commitComments.pageInfo.endCursor;
            if (socket != null) {
              socket.emit('getAllData', data);
            }
            // nouvel appel sur l'API github, depuis le dernier élément chargé
            fetchAndProcessPage(api, numberElementToFetch, cursorId);
          } else {
            // Envoi des données
            data.completed = true;
            if (socket != null) {
              socket.emit('getAllData', data);
              resolve(data);
            }
          }
        }).catch((err) => {
          // En cas d'erreur
          console.log('Error on agent : ');
          // socket.emit('getAllData', { error: err });
          reject(err);
        });
      }

      // Première appel sur l'API github
      fetchAndProcessPage(this.api, numberElementToFetch, null);
    });
  }
}

module.exports = Agent;
