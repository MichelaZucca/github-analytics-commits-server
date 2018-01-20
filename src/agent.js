// Déclare la dépendance sur GithubGraphQl
const GithubGraphQLApi = require('node-github-graphql');

// Déclare l'agent
class Agent {
  // Constructeur
  constructor(url, token) {
    this.api = new GithubGraphQLApi({
      url,
      token,
      debug: true,
    });
  }

  getAllData(owner, name, numberElementToFetch) {
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

          // Object qui sera renvoyé au serveur
          const data = {
            name: res.data.repository.nameWithOwner,
            description: res.data.repository.description,
            totalCommits: res.data.repository.commitComments.totalCount,
            commits: commitsContent,
          };

          const hasNextPage = res.data.repository.commitComments.pageInfo.hasNextPage;
          console.log(hasNextPage);
          // Pagination, récupère toutes les pages les unes après les autres
          if (hasNextPage) {
            const cursorId = res.data.repository.commitComments.pageInfo.endCursor;
            // nouvel appel sur l'API github, depuis le dernier élément chargé
            fetchAndProcessPage(api, numberElementToFetch, cursorId);
          } else {
            // Envoi des données
            resolve(data);
          }
        }).catch((err) => {
          // En cas d'erreur
          reject(err);
        });
      }

      // Première appel sur l'API github
      fetchAndProcessPage(this.api, numberElementToFetch, null);
    });
  }
}

module.exports = Agent;
